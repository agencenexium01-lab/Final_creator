// Accès Firebase côté serveur (fonctions Vercel). Ne jamais importer depuis src/.
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Configuration Firebase Admin incomplète (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).');
  }
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
}

/** Base Firestore : nommée si FIREBASE_DATABASE_ID est défini (ex. base créée par AI Studio). */
export function adminDb() {
  const app = getAdminApp();
  const dbId = process.env.FIREBASE_DATABASE_ID;
  return dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);
}

export function adminAuth() {
  return getAuth(getAdminApp());
}
