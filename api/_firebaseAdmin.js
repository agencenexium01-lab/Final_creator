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

    const dbId = process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID;
    
    // 💡 LOG DE SÉCURITÉ : On vérifie ce qui est envoyé à Google Cloud
    console.log(`[ADMIN INIT] Initialisation pour le projet: "${projectId}" | Base de données ciblée: "${dbId || '(default)'}"`);

    const appConfig = {
      credential: cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: formattedPrivateKey,
      })
    };

    // N'injecter databaseId que si la variable existe ET n'est pas "(default)"
    if (dbId && dbId !== '(default)') {
      appConfig.databaseId = dbId;
    }

    initializeApp(appConfig);
    
    console.log("🔥 Firebase Admin initialisé proprement !");
  } catch (error) {
    console.error("❌ Erreur critique Firebase Admin:", error.message);
    throw error;
  }
}

export const adminDb = getFirestore();