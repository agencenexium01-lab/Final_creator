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

    initializeApp({
      credential: cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: formattedPrivateKey,
      }),
    });
    
    console.log("🔥 Firebase Admin initialisé sans JSON.parse !");
  } catch (error) {
    console.error("❌ Erreur critique Firebase Admin:", error.message);
    throw error;
  }
}

// 💡 CORRECTION: Récupérer l'ID de la base de données depuis les variables d'environnement
// On regarde d'abord une variable dédiée, sinon on réutilise celle de Vite présente sur Vercel
const dbId = process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID;

// On passe l'ID de la base directement à getFirestore() pour l'Admin SDK
export const adminDb = dbId ? getFirestore(dbId) : getFirestore();