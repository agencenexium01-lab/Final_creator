import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const TOOL_COSTS: Record<string, number> = {
  hooks: 1,
  script: 1,
  ideas: 1,
  calendar: 2,
};

// 💡 Fonction d'assistance pour générer un jeton d'accès Google OAuth2 à partir de tes variables d'environnement
async function getGoogleAuthToken(clientEmail: string, privateKey: string): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/datastore', // Donne accès à Firestore
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const base64UrlEncode = (str: string) => 
    Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(`${encodedHeader}.${encodedPayload}`);
  const signature = base64UrlEncode(sign.sign(privateKey.replace(/\\n/g, '\n')));

  const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;

  // Échange du JWT contre un jeton d'accès de courte durée auprès des serveurs Google
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange JWT for token: ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token;
}

const buildPrompt = (tool: string, params: Record<string, any>) => {
  const { niche, platform, topic, tone, hook, message, goal, duration } = params;
  const context = `Niche: ${niche || 'générique'}\nPlateforme: ${platform || 'both'}\n`; 

  if (tool === 'hooks') {
    return `${context}Tu es un expert en marketing viral dans l'espace francophone. Génère 10 hooks d'accroche très impactants pour du contenu court. Réponds uniquement par un objet JSON valide:
{
  "hooks": [
    {"hook": "...", "framework": "...", "platform": "...", "score": 0, "justification": "..."}
  ]
}

Sujet: ${topic || 'général'}\nTon: ${tone || 'Motivationnel'}`;
  }

  if (tool === 'script') {
    return `${context}Tu es un expert en création de scripts pour vidéos courtes. Génère un script complet structuré dans un format JSON valide:
{
  "platform": "...",
  "sections": [
    {"id": "...", "label": "...", "content": "...", "visual_note": "..."}
  ]
}

Objectif: ${goal || 'Inspirer et motiver'}\nHook: ${hook || 'Accroche forte'}\nMessage: ${message || 'Message principal'}\nDurée: ${duration || '60 sec'}`;
  }

  if (tool === 'ideas') {
    return `${context}Tu es un stratège de contenus créatifs. Propose 20 idées originales sous la forme d'un JSON valide:
{
  "ideas": [
    {"title": "...", "description": "...", "format": "...", "platform": "..."}
  ]
}

Objectif: ${goal || "Créer de l'engagement"}\nTon: ${tone || 'Inspirant'}`;
  }

  if (tool === 'calendar') {
    return `${context}Crée un calendrier éditorial de 30 jours pour un compte créateur. Réponds uniquement par un JSON valide:
{
  "calendar": [
    {"day": 1, "week": 1, "idea": "...", "hook": "...", "format": "...", "platform": "..."}
  ]
}

Objectif: ${goal || 'Planifier le contenu du mois'}\nDurée: ${duration || '30 jours'}`;
  }

  return `${context}Réponds uniquement par un JSON valide contenant le résultat attendu.`;
};

const extractJson = (text: string) => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error('Unable to parse JSON response from Gemini');
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId, tool, params } = req.body;

    console.log(`[REST BACKEND] Outil: "${tool}" | ID Utilisateur: "${userId}"`);

    if (!userId || !tool) {
      return res.status(400).json({ error: 'Missing userId or tool' });
    }

    const requiredCost = TOOL_COSTS[tool];
    if (requiredCost === undefined) {
      return res.status(400).json({ error: 'Invalid tool type' });
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const dbId = process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID;
    const geminiKey = process.env.GEMINI_API_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !dbId || !geminiKey || !clientEmail || !privateKey) {
      return res.status(500).json({ error: 'Missing environment variables on Vercel' });
    }

    // 💡 ÉTAPE CRUCIALE : Générer le Bearer Token d'authentification pour Firestore REST
    let authToken: string;
    try {
      authToken = await getGoogleAuthToken(clientEmail, privateKey);
    } catch (authErr: any) {
      console.error('[REST AUTH ERROR] Impossible de générer le jeton Google Cloud :', authErr.message);
      return res.status(500).json({ error: 'DATABASE_AUTH_FAILED', details: authErr.message });
    }

    const firestoreUserUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/users/${userId}`;

    const userResponse = await fetch(firestoreUserUrl, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (!userResponse.ok) {
      if (userResponse.status === 404) {
        return res.status(404).json({ error: 'User not found in Firestore via REST' });
      }
      const rawErr = await userResponse.text();
      console.error('[REST ERROR] Échec de lecture utilisateur:', rawErr);
      return res.status(500).json({ error: 'DATABASE_FETCH_FAILED', details: rawErr });
    }

    const userDoc = await userResponse.json();
    
    const creditsValue = userDoc.fields?.credits?.integerValue || userDoc.fields?.credits?.doubleValue || "0";
    const currentCredits = parseInt(creditsValue, 10);

    console.log(`[REST DEBUG] Crédits authentifiés trouvés : ${currentCredits}`);

    if (currentCredits < requiredCost) {
      return res.status(402).json({ error: 'INSUFFICIENT_CREDITS' });
    }

   // 2. Appel à l'API Gemini (Utilisation du modèle 2.0 Flash disponible dans ton projet)
    const prompt = buildPrompt(tool, params || {});
    
    console.log("[GEMINI] Envoi du prompt au modèle gemini-2.0-flash...");

    const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: prompt }] 
        }]
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[GEMINI ERROR] Code:', aiResponse.status, 'Détails:', errorText);
      return res.status(502).json({ error: 'Gemini API error', status: aiResponse.status, details: errorText });
    }

    const aiData = await aiResponse.json();
    const aiText = aiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const parsedResult = extractJson(aiText);

    // 3. Mise à jour des crédits (avec en-tête Authorization !)
    const newCredits = currentCredits - requiredCost;
    const totalCreditsUsedValue = userDoc.fields?.totalCreditsUsed?.integerValue || userDoc.fields?.totalCreditsUsed?.doubleValue || "0";
    const newTotalUsed = parseInt(totalCreditsUsedValue, 10) + requiredCost;

    const updateResponse = await fetch(`${firestoreUserUrl}?updateMask.fieldPaths=credits&updateMask.fieldPaths=totalCreditsUsed`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        fields: {
          credits: { integerValue: String(newCredits) },
          totalCreditsUsed: { integerValue: String(newTotalUsed) }
        }
      })
    });

    if (!updateResponse.ok) {
      console.error('[REST ERROR] Échec de la déduction de crédits:', await updateResponse.text());
    }

    // 4. Enregistrement de l'historique de génération (avec en-tête Authorization !)
    const firestoreGenUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/generations`;
    await fetch(firestoreGenUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        fields: {
          user_id: { stringValue: userId },
          tool: { stringValue: tool },
          niche: { stringValue: params?.niche || '' },
          platform: { stringValue: params?.platform || '' },
          created_at: { stringValue: new Date().toISOString() },
          output_data_string: { stringValue: JSON.stringify(parsedResult) }
        }
      })
    });

    return res.status(200).json({ result: parsedResult });

  } catch (error: any) {
    console.error('REST Function Global Error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}