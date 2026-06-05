import { adminDb } from './_firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

const PACK_CREDITS: Record<string, number> = {
  starter: 50,
  createur: 150,
  pro: 350,
};

export const handler = async (event: any) => {
  try {
    const payload = JSON.parse(event.body || '{}');

    if (payload.event !== 'successful.sale') {
      return { statusCode: 200, body: JSON.stringify({ body: 'Ignored' }) };
    }

    const sale = payload.sale;
    const saleId = sale?.id;
    const customMetadata = sale?.custom_metadata || {};
    const userId = customMetadata.userId;
    const pack = customMetadata.pack;

    if (!saleId || !userId || !pack) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid webhook payload' }) };
    }

    const packCredits = PACK_CREDITS[pack];
    if (!packCredits) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Unknown pack type' }) };
    }

    const saleRef = adminDb.doc(`processed_sales/${saleId}`);
    const userRef = adminDb.doc(`users/${userId}`);

    await adminDb.runTransaction(async (transaction) => {
      const saleDoc = await transaction.get(saleRef);
      if (saleDoc.exists) {
        return;
      }

      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      transaction.set(saleRef, {
        processedAt: new Date(),
        userId,
        pack,
      });

      transaction.update(userRef, {
        credits: FieldValue.increment(packCredits),
        totalCreditsPurchased: FieldValue.increment(packCredits),
        lastPurchaseDate: new Date().toISOString(),
        lastPurchasePack: pack,
      });
    });

    return { statusCode: 200, body: JSON.stringify({ body: 'Processed' }) };
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Webhook error' }) };
  }
};
