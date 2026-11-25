import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from './_lib/firebaseAdmin.js';
import { readSale, verifyPulseSignature } from './_lib/pulse.js';

/** Corps brut : la signature porte sur les octets exacts envoyés par Chariow (ne pas lire req.body avant). */
async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  return Buffer.concat(chunks);
}

async function findUserId(userId: string | null, email: string | null): Promise<string | null> {
  if (userId) return userId;
  if (!email) return null;
  // Achat fait via l'ancienne page produit (sans user_id) : rapprochement par e-mail.
  try {
    return (await adminAuth().getUserByEmail(email)).uid;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const raw = await readRawBody(req);
  const signature = req.headers['x-chariow-signature'];
  if (!verifyPulseSignature(raw, Array.isArray(signature) ? signature[0] : signature, process.env.CHARIOW_PULSE_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw.toString('utf8'));
  } catch {
    return res.status(400).send('Invalid JSON');
  }

  const sale = readSale(payload, process.env);
  if (sale.kind === 'ignore') {
    console.log('[pulse] ignoré :', sale.reason);
    return res.status(200).send('OK');
  }

  const db = adminDb();
  try {
    const uid = await findUserId(sale.userId, sale.email);
    const saleRef = db.doc(`processed_sales/${sale.saleId}`);

    if (!uid) {
      // On répond 200 pour que Chariow ne désactive pas le Pulse ; la vente est à traiter à la main.
      await db.doc(`unmatched_sales/${sale.saleId}`).set(
        { email: sale.email, packId: sale.packId, credits: sale.credits, receivedAt: new Date().toISOString(), payload },
        { merge: true },
      );
      console.error('[pulse] vente sans compte correspondant', sale.saleId, sale.email);
      return res.status(200).send('OK');
    }

    const userRef = db.doc(`users/${uid}`);
    await db.runTransaction(async (tx) => {
      // Une vente = un crédit, même si Chariow livre plusieurs fois.
      if ((await tx.get(saleRef)).exists) return;
      const user = await tx.get(userRef);
      if (!user.exists) throw new Error(`Profil ${uid} introuvable`);
      tx.set(saleRef, {
        userId: uid,
        packId: sale.packId,
        credits: sale.credits,
        email: sale.email,
        processedAt: new Date().toISOString(),
      });
      tx.update(userRef, {
        credits: FieldValue.increment(sale.credits),
        totalCreditsPurchased: FieldValue.increment(sale.credits),
        lastPurchaseDate: new Date().toISOString(),
        lastPurchasePack: sale.packId,
      });
    });
    return res.status(200).send('OK');
  } catch (err) {
    // 500 → Chariow réessaie (10 s, 100 s, ~17 min, ~2 h 47).
    console.error('[pulse] échec', sale.saleId, err instanceof Error ? err.message : err);
    return res.status(500).send('Retry');
  }
}
