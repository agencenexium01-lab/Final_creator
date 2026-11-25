import { authService } from './authService';
import type { GenerationOutput, ToolId } from '../types';
import type { PackId } from '../config/pricing';

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const token = await authService.getIdToken();
  let response: Response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'NETWORK', 'Connexion impossible. Vérifie ton accès à Internet.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(response.status, data?.error ?? 'UNKNOWN', data?.message ?? 'Une erreur est survenue.');
  }
  return data as T;
}

export interface CheckoutRequest {
  pack: PackId;
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
}

export const apiService = {
  async initiateCheckout(request: CheckoutRequest): Promise<string> {
    const { checkoutUrl } = await post<{ checkoutUrl: string }>('/api/initiate-checkout', request);
    return checkoutUrl;
  },

  generate(tool: ToolId, params: Record<string, string>) {
    return post<{ id: string | null; result: Exclude<GenerationOutput, string>; credits: number }>('/api/generate', {
      tool,
      params,
    });
  },
};
