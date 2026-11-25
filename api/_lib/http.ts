import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAuth } from './firebaseAdmin.js';

export class HttpError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/**
 * Vérifie le jeton Firebase envoyé dans `Authorization: Bearer <idToken>`.
 * L'identité vient du jeton, jamais du corps de la requête.
 */
export async function requireUser(req: VercelRequest): Promise<{ uid: string; email: string | null; name: string | null }> {
  const header = req.headers.authorization;
  const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'UNAUTHENTICATED', 'Connecte-toi pour continuer.');
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    return { uid: decoded.uid, email: decoded.email ?? null, name: (decoded.name as string | undefined) ?? null };
  } catch {
    throw new HttpError(401, 'UNAUTHENTICATED', 'Session expirée. Reconnecte-toi.');
  }
}

export function allowMethods(req: VercelRequest, res: VercelResponse, methods: string[]): boolean {
  if (methods.includes(req.method ?? '')) return true;
  res.setHeader('Allow', methods.join(', '));
  res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Méthode non autorisée.' });
  return false;
}

/** Réponse d'erreur sans détail interne : les détails restent dans les logs serveur. */
export function sendError(res: VercelResponse, err: unknown, context: string) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.code, message: err.message });
  }
  console.error(`[${context}]`, err instanceof Error ? err.message : err);
  return res.status(500).json({ error: 'INTERNAL', message: 'Une erreur est survenue. Réessaie dans un instant.' });
}

/** URL publique du site, pour les redirections de paiement. */
export function appUrl(): string {
  return (process.env.APP_URL || 'https://creator-booster.vercel.app').replace(/\/+$/, '');
}
