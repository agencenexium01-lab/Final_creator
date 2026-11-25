// Types minimaux des fonctions Vercel (Node). Remplace le paquet @vercel/node,
// qui ne servait qu'aux types et embarquait des dépendances vulnérables.
import type { IncomingMessage, ServerResponse } from 'node:http';

export interface VercelRequest extends IncomingMessage {
  /** Corps JSON déjà décodé par Vercel (ne pas lire si le corps brut est nécessaire). */
  body: any;
  query: Record<string, string | string[]>;
  cookies: Record<string, string>;
}

export interface VercelResponse extends ServerResponse {
  status(code: number): VercelResponse;
  json(body: unknown): VercelResponse;
  send(body: unknown): VercelResponse;
}
