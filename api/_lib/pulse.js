// Webhooks Chariow (« Pulses ») : vérification de signature et lecture d'une vente.
// Doc : https://chariow.dev/en/guides/pulse-security et https://chariow.dev/en/guides/pulses
import crypto from 'node:crypto';
import { getPackByProductEnvKey } from '../../src/shared/pricing.js';

/**
 * Vérifie l'en-tête `x-chariow-signature` (« sha256= » + HMAC-SHA256 hex du corps brut).
 * @param {Buffer | string} rawBody  Corps exact reçu, avant tout JSON.parse
 * @param {string | undefined | null} header
 * @param {string | undefined} secret  Secret du Pulse (whsec_…)
 */
export function verifyPulseSignature(rawBody, header, secret) {
  if (!secret || typeof header !== 'string' || !header.startsWith('sha256=')) return false;
  const expected = Buffer.from('sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex'));
  const received = Buffer.from(header);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

/**
 * Extrait d'un payload `successful.sale` ce qu'il faut pour créditer un compte.
 * Le pack est déduit de l'id produit (fiable) et non des métadonnées (modifiables par le client).
 * @param {any} payload
 * @param {Record<string, string | undefined>} env
 * @returns {{ kind: 'ignore', reason: string } | { kind: 'sale', saleId: string, userId: string | null, email: string | null, packId: string, credits: number }}
 */
export function readSale(payload, env) {
  if (payload?.event !== 'successful.sale') return { kind: 'ignore', reason: `événement ${payload?.event ?? 'inconnu'}` };
  const s = payload.sale;
  if (!s?.id) return { kind: 'ignore', reason: 'vente sans identifiant' };
  if (s.status && s.status !== 'completed') return { kind: 'ignore', reason: `vente au statut ${s.status}` };

  const pack = getPackByProductEnvKey(payload.product?.id, env);
  if (!pack) return { kind: 'ignore', reason: `produit ${payload.product?.id ?? 'absent'} non lié à un pack` };

  const meta = s.custom_metadata && typeof s.custom_metadata === 'object' ? s.custom_metadata : {};
  const userId = typeof meta.user_id === 'string' && meta.user_id ? meta.user_id
    : typeof meta.userId === 'string' && meta.userId ? meta.userId
    : null;
  const email = typeof payload.customer?.email === 'string' ? payload.customer.email.trim().toLowerCase() : null;

  return { kind: 'sale', saleId: String(s.id), userId, email, packId: pack.id, credits: pack.credits };
}
