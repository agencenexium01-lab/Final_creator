import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HttpError, allowMethods, appUrl, requireUser, sendError } from './_lib/http.js';
import { getPack } from '../src/shared/pricing.js';
import { normalizePhone } from '../src/shared/phone.js';

const NAME_MAX = 50;

function cleanName(value: unknown, label: string): string {
  const v = typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : '';
  if (!v) throw new HttpError(400, 'INVALID_INPUT', `Indique ton ${label}.`);
  if (v.length > NAME_MAX) throw new HttpError(400, 'INVALID_INPUT', `Ton ${label} dépasse ${NAME_MAX} caractères.`);
  return v;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['POST'])) return;
  try {
    const { uid, email } = await requireUser(req);
    if (!email) throw new HttpError(400, 'EMAIL_REQUIRED', 'Ton compte doit avoir une adresse e-mail pour payer.');

    const pack = getPack(String(req.body?.pack ?? ''));
    if (!pack) throw new HttpError(400, 'INVALID_PACK', 'Pack inconnu.');
    const productId = process.env[pack.productEnvKey];
    if (!productId) throw new Error(`${pack.productEnvKey} non configurée`);

    const firstName = cleanName(req.body?.firstName, 'prénom');
    const lastName = cleanName(req.body?.lastName, 'nom');
    const phone = normalizePhone(String(req.body?.country ?? ''), String(req.body?.phone ?? ''));
    if (!phone.ok) throw new HttpError(400, 'INVALID_PHONE', phone.error);

    const response = await fetch('https://api.chariow.com/v1/checkout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.CHARIOW_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        email,
        first_name: firstName,
        last_name: lastName,
        phone: { number: phone.number, country_code: phone.countryCode },
        redirect_url: `${appUrl()}/dashboard?payment=return`,
        // Relie la vente au compte : relu par le webhook pour créditer le bon utilisateur.
        custom_metadata: { user_id: uid, pack: pack.id },
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('[checkout] Chariow', response.status, JSON.stringify(data).slice(0, 500));
      throw new HttpError(400, 'CHECKOUT_REFUSED', data?.message || 'Le paiement a été refusé. Vérifie ton numéro et réessaie.');
    }

    const step = data?.data?.step;
    if (step === 'already_purchased') {
      // Arrive si le produit Chariow n'autorise pas les achats multiples.
      console.error('[checkout] already_purchased : activer les achats multiples sur', productId);
      throw new HttpError(409, 'ALREADY_PURCHASED', "Ce pack ne peut pas être racheté pour l'instant. Contacte le support.");
    }
    const checkoutUrl: string | undefined = data?.data?.payment?.checkout_url;
    if (step !== 'payment' || !checkoutUrl) {
      console.error('[checkout] réponse inattendue', JSON.stringify(data).slice(0, 500));
      throw new HttpError(502, 'CHECKOUT_FAILED', "Impossible d'ouvrir la page de paiement. Réessaie dans un instant.");
    }
    return res.status(200).json({ checkoutUrl });
  } catch (err) {
    return sendError(res, err, 'checkout');
  }
}
