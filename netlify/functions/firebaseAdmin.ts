import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  const credential = process.env.FIREBASE_ADMIN_SDK
    ? cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK))
    : undefined;

  initializeApp({ credential });
}

export const adminDb = getFirestore();
