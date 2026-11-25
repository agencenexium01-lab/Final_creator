import type { VercelRequest, VercelResponse } from '@vercel/node';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from './_lib/firebaseAdmin.js';
import { HttpError, allowMethods, requireUser, sendError } from './_lib/http.js';
import { getToolCost } from '../src/shared/pricing.js';
import { buildPrompt, normalizeResult, RESPONSE_SCHEMAS, validateGenerationInput } from '../src/shared/generation.js';
import { getCountry } from '../src/shared/phone.js';

type ToolId = 'hooks' | 'ideas' | 'script' | 'calendar';

/** Délai minimum entre deux générations d'un même compte. */
const MIN_INTERVAL_MS = 5_000;
const GEMINI_TIMEOUT_MS = 50_000;

async function callGemini(system: string, user: string, tool: ToolId): Promise<unknown> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY manquante');
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
          responseSchema: RESPONSE_SCHEMAS[tool],
          // Peu de « réflexion » : les sorties sont créatives, pas des calculs. Réduit coût et latence.
          thinkingConfig: { thinkingBudget: 512 },
        },
      }),
    });
    if (!response.ok) {
      throw new Error(`Gemini ${response.status}: ${(await response.text()).slice(0, 500)}`);
    }
    const data = await response.json();
    const text: string = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    return JSON.parse(text);
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['POST'])) return;

  let charged: { uid: string; cost: number } | null = null;
  const db = adminDb();

  try {
    const { uid } = await requireUser(req);
    const tool = String(req.body?.tool ?? '');
    const cost = getToolCost(tool);
    if (cost === null) throw new HttpError(400, 'INVALID_TOOL', 'Outil inconnu.');

    const input = validateGenerationInput(tool, req.body?.params ?? {});
    if (!input.ok) throw new HttpError(400, 'INVALID_INPUT', input.error);

    const userRef = db.doc(`users/${uid}`);

    // 1. Réserver les crédits AVANT d'appeler l'IA, dans une transaction : deux requêtes
    //    simultanées ne peuvent pas dépenser le même solde.
    const { country } = await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) throw new HttpError(404, 'USER_NOT_FOUND', 'Profil introuvable.');
      const user = snap.data() as { credits?: number; lastGenerationAt?: number; country?: string };
      const credits = Number(user.credits) || 0;
      if (credits < cost) throw new HttpError(402, 'INSUFFICIENT_CREDITS', `Il te faut ${cost} crédits pour cet outil.`);
      if (user.lastGenerationAt && Date.now() - user.lastGenerationAt < MIN_INTERVAL_MS) {
        throw new HttpError(429, 'TOO_FAST', 'Une génération est déjà en cours. Patiente quelques secondes.');
      }
      tx.update(userRef, {
        credits: FieldValue.increment(-cost),
        totalCreditsUsed: FieldValue.increment(cost),
        lastGenerationAt: Date.now(),
      });
      return { country: user.country };
    });
    charged = { uid, cost };

    // 2. Générer (une nouvelle tentative si la réponse est inutilisable).
    const prompt = buildPrompt(tool as ToolId, input.params, {
      countryName: country ? getCountry(country)?.name : undefined,
      today: new Date(),
    });
    let result = null;
    for (let attempt = 0; attempt < 2 && !result; attempt++) {
      try {
        result = normalizeResult(tool as ToolId, await callGemini(prompt.system, prompt.user, tool as ToolId));
      } catch (err) {
        console.error('[generate] tentative', attempt + 1, err instanceof Error ? err.message : err);
      }
    }
    if (!result) throw new HttpError(502, 'GENERATION_FAILED', "L'IA n'a pas répondu correctement. Tes crédits ont été remboursés, réessaie.");

    charged = null; // Contenu obtenu : les crédits sont dus, même si l'archivage échoue.

    // 3. Archiver la génération pour l'historique.
    let id: string | null = null;
    try {
      const genRef = await db.collection('generations').add({
        user_id: uid,
        tool,
        cost,
        niche: input.params.niche,
        platform: input.params.platform,
        input_data: input.params,
        output_data: result,
        created_at: new Date().toISOString(),
      });
      id = genRef.id;
    } catch (e) {
      console.error('[generate] archivage impossible', e instanceof Error ? e.message : e);
    }

    const after = await userRef.get();
    return res.status(200).json({ id, result, credits: Number(after.get('credits')) || 0 });
  } catch (err) {
    if (charged) {
      const { uid, cost } = charged;
      await db
        .doc(`users/${uid}`)
        .update({ credits: FieldValue.increment(cost), totalCreditsUsed: FieldValue.increment(-cost), lastGenerationAt: 0 })
        .catch((e) => console.error('[generate] remboursement impossible pour', uid, e));
    }
    return sendError(res, err, 'generate');
  }
}
