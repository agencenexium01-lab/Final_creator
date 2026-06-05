
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyBaJ0a1Iq2O4tcKN80BndjeUwSfLR6qy_w",
  authDomain: "gen-lang-client-0998329295.firebaseapp.com",
  projectId: "gen-lang-client-0998329295",
  storageBucket: "gen-lang-client-0998329295.firebasestorage.app",
  messagingSenderId: "314161268168",
  appId: "1:314161268168:web:eaafb9e2af9b31337eecfd"
};

const app = initializeApp(firebaseConfig);
const databaseId = import.meta.env.VITE_FIREBASE_DATABASE_ID;
export const db = databaseId
  ? getFirestore(app, databaseId)
  : getFirestore(app);
export const auth = getAuth(app);
