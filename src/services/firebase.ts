import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const env = import.meta.env;
const missing = (['VITE_FIREBASE_API_KEY', 'VITE_FIREBASE_AUTH_DOMAIN', 'VITE_FIREBASE_PROJECT_ID', 'VITE_FIREBASE_APP_ID'] as const).filter(
  (key) => !env[key],
);
if (missing.length) {
  // Message explicite au lieu de « auth/invalid-api-key ».
  throw new Error(
    `Configuration Firebase manquante : ${missing.join(', ')}. ` +
      'En local, crée le fichier .env.local (modèle : .env.example) puis relance npm run dev. Sur Vercel, ajoute ces variables dans Settings > Environment Variables.',
  );
}

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);

// Base nommée (créée par AI Studio) si VITE_FIREBASE_DATABASE_ID est défini, sinon base par défaut.
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
export const db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
