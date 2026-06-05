import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1. Gestion des CORS et de la méthode POST
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { pack, userId, email, firstName, lastName, phone } = req.body;

    console.log('📥 Données reçues par la fonction Vercel:', { pack, userId, email, firstName, lastName, phone });

    if (!pack || !userId || !email || !firstName || !lastName) {
      console.error('❌ Champs obligatoires manquants');
      return res.status(400).json({ error: 'Champs obligatoires manquants' });
    }

    const productIdMap: Record<string, string | undefined> = {
      starter: process.env.CHARIOW_PRODUCT_STARTER,
      createur: process.env.CHARIOW_PRODUCT_CREATEUR,
      pro: process.env.CHARIOW_PRODUCT_PRO,
    };

    const productId = productIdMap[pack];

    if (!productId) {
      return res.status(400).json({ error: 'Invalid pack type' });
    }

    // --- PARSING DYNAMIQUE INTERNATIONAL ---
    let cleanPhone = phone ? phone.trim().replace(/\s+/g, '') : '';
    let countryCode = 'BJ'; 
    let numberOnly = cleanPhone;

    if (cleanPhone.startsWith('+')) {
      const match = cleanPhone.match(/^\+(\d{1,4})(\d{6,14})$/);
      if (match) {
        const numericCode = match[1];
        numberOnly = match[2];
        const countryMap: Record<string, string> = {
          '229': 'BJ', '225': 'CI', '228': 'TG', '221': 'SN', 
          '226': 'BF', '223': 'ML', '237': 'CM', '242': 'CG', '33': 'FR'
        };
        countryCode = countryMap[numericCode] || 'BJ';
      }
    } else if (cleanPhone.startsWith('00')) {
      const match = cleanPhone.match(/^00(\d{1,4})(\d{6,14})$/);
      if (match) {
        const numericCode = match[1];
        numberOnly = match[2];
        const countryMap: Record<string, string> = {
          '229': 'BJ', '225': 'CI', '228': 'TG', '221': 'SN', '226': 'BF', '223': 'ML', '33': 'FR'
        };
        countryCode = countryMap[numericCode] || 'BJ';
      }
    } else {
      const digits = cleanPhone.replace(/\D/g, '');
      let foundCode = false;
      for (const code of ['229', '225', '228', '221', '226', '223']) {
        if (digits.startsWith(code) && digits.length > code.length + 5) {
          const countryMap: Record<string, string> = { '229': 'BJ', '225': 'CI', '228': 'TG', '221': 'SN', '226': 'BF', '223': 'ML' };
          countryCode = countryMap[code];
          numberOnly = digits.substring(code.length);
          foundCode = true;
          break;
        }
      }
      if (!foundCode) {
        numberOnly = digits;
      }
    }

    if (!numberOnly || numberOnly.length < 6) {
      countryCode = 'BJ';
      numberOnly = '97001122'; 
    }

    const chariowPayload = {
      product_id: productId,
      email: email.trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: {
        number: numberOnly,
        country_code: countryCode
      },
      redirect_url: 'https://creator-booster-ia.netlify.app/dashboard?payment=success',
      custom_metadata: {
        userId,
        pack,
      },
    };

    console.log('📤 Envoi du payload à Chariow depuis Vercel:', chariowPayload);

    const response = await fetch('https://api.chariow.com/v1/checkout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CHARIOW_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(chariowPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Chariow API error:', data);
      return res.status(502).json({ error: data?.message || 'Failed to create checkout session' });
    }

    const checkoutUrl = data.checkout_url || data.data?.checkout_url || data.data?.payment?.checkout_url;

    return res.status(200).json({ checkout_url: checkoutUrl });
  } catch (error: any) {
    console.error('initiate-checkout error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}