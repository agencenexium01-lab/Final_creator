import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error("Variables d'environnement Firebase Admin incomplètes sur Vercel !");
    }

    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

    // 💡 LA CORRECTION EST ICI : 
    // Si tu as une base de données nommée, on la passe dans les options de initializeApp
    const dbId = process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID;
    
    const appConfig = {
      credential: cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: formattedPrivateKey,
      })
    };

    // Si un ID de base existe et n'est pas la base par défaut, on l'injecte
    if (dbId) {
      appConfig.databaseId = dbId;
    }

    initializeApp(appConfig);
    
    console.log("🔥 Firebase Admin initialisé proprement avec la bonne base !");
  } catch (error) {
    console.error("❌ Erreur critique Firebase Admin:", error.message);
    throw error;
  }
}

// On l'instancie normalement maintenant, il héritera de la config passée au-dessus
export const adminDb = getFirestore();