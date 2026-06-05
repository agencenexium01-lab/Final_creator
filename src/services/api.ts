export interface CheckoutRequest {
  pack: 'starter' | 'createur' | 'pro';
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface GenerateRequest {
  userId: string;
  tool: string;
  params: Record<string, any>;
}

const parseJsonResponse = async (response: Response) => {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload?.error || 'Erreur de communication avec le serveur');
  }
  return payload;
};

export const apiService = {
  initiateCheckout: async (checkoutRequest: CheckoutRequest): Promise<string> => {
    console.log('🔍 Payload envoyé au backend:', {
      pack: checkoutRequest.pack,
      userId: checkoutRequest.userId,
      email: checkoutRequest.email,
      firstName: checkoutRequest.firstName,
      lastName: checkoutRequest.lastName,
      phone: checkoutRequest.phone,
    });
    const response = await fetch('/api/initiate-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutRequest),
    });

    const data = await parseJsonResponse(response);
    if (!data.checkout_url) {
      throw new Error(data.error || 'Impossible de récupérer l’URL de paiement');
    }

    return data.checkout_url;
  },

  generateContent: async (generateRequest: GenerateRequest): Promise<any> => {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(generateRequest),
    });

    const data = await parseJsonResponse(response);
    return data.result;
  },
};
