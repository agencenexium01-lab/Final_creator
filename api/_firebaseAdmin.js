import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (getApps().length === 0) {
  try {
    let serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccountVar) {
      throw new Error("La variable d'environnement FIREBASE_SERVICE_ACCOUNT est manquante !");
    }

    // 💡 NETTOYAGE ULTRA-ROBUSTE : On remplace les vrais sauts de ligne physiques par des "\n" textuels
    // et on vire les caractères de contrôle qui font planter JSON.parse
    serviceAccountVar = serviceAccountVar
      .replace(/\r?\n/g, '\\n') // Transforme les sauts de ligne physiques en "\n"
      .replace(/\\n/g, '\n');    // Puis les remet au format attendu par la clé privée

    // Optionnel : Si Vercel a entouré la chaîne de guillemets doubles en trop
    if (serviceAccountVar.startsWith('"') && serviceAccountVar.endsWith('"')) {
      serviceAccountVar = serviceAccountVar.slice(1, -1);
    }

    const serviceAccount = JSON.parse(serviceAccountVar);

    initializeApp({
      credential: cert(serviceAccount),
    });
    
    console.log("🔥 Firebase Admin initialisé avec succès !");
  } catch (error) {
    console.error("❌ Erreur critique lors de l'initialisation de Firebase Admin:", error.message);
    throw error;
  }
}

export const adminDb = getFirestore();