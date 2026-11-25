import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile as updateAuthProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { UserProfile } from '../types';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/** Champs que l'utilisateur peut modifier (les règles Firestore refusent le reste). */
export type EditableProfile = Pick<UserProfile, 'name' | 'niche' | 'platform' | 'country' | 'onboarding_completed'>;

function displayNameFor(user: User, fallback?: string) {
  const raw = (fallback || user.displayName || user.email?.split('@')[0] || 'Créateur').trim();
  const name = raw.slice(0, 50);
  return name.length >= 2 ? name : 'Créateur';
}

/** Crée le profil s'il n'existe pas encore (solde à zéro). */
async function ensureProfile(user: User, name?: string): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  if ((await getDoc(ref)).exists()) return;
  const profile: UserProfile = {
    id: user.uid,
    name: displayNameFor(user, name),
    email: user.email ?? '',
    platform: 'both',
    credits: 0,
    totalCreditsUsed: 0,
    totalCreditsPurchased: 0,
    lastPurchaseDate: '',
    lastPurchasePack: '',
    onboarding_completed: false,
    created_at: new Date().toISOString(),
  };
  try {
    await setDoc(ref, profile);
  } catch (err) {
    // Deux onglets peuvent créer le profil en même temps : si le document existe maintenant, tout va bien.
    if (!(await getDoc(ref)).exists()) throw err;
  }
}

export const authService = {
  async loginWithGoogle() {
    const { user } = await signInWithPopup(auth, googleProvider);
    await ensureProfile(user);
  },

  async loginWithEmailPassword(email: string, password: string) {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    await ensureProfile(user);
  },

  async registerWithEmailPassword(name: string, email: string, password: string) {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateAuthProfile(user, { displayName: name }).catch(() => undefined);
    await ensureProfile(user, name);
  },

  sendPasswordResetEmail: (email: string) => sendPasswordResetEmail(auth, email),

  logout: () => signOut(auth),

  async updateProfile(updates: Partial<EditableProfile>) {
    const current = auth.currentUser;
    if (!current) throw new Error('Non connecté');
    await updateDoc(doc(db, 'users', current.uid), updates);
  },

  /** Jeton à envoyer aux fonctions serveur. */
  async getIdToken(): Promise<string> {
    const current = auth.currentUser;
    if (!current) throw new Error('Connecte-toi pour continuer.');
    return current.getIdToken();
  },

  /**
   * Suit la session ET le profil en temps réel (le solde se met à jour seul après un paiement).
   * Retourne une fonction de désinscription.
   */
  watchSession(onProfile: (profile: UserProfile | null) => void, onError: () => void, onPending: (pending: boolean) => void): () => void {
    let stopProfile: (() => void) | null = null;
    const stopAuth = onAuthStateChanged(auth, async (user) => {
      stopProfile?.();
      stopProfile = null;
      if (!user) {
        onProfile(null);
        return;
      }
      onPending(true);
      try {
        await ensureProfile(user);
      } catch (err) {
        console.error('Création du profil impossible', err);
      }
      stopProfile = onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => onProfile(snap.exists() ? (snap.data() as UserProfile) : null),
        (err) => {
          console.error('Lecture du profil impossible', err);
          onError();
        },
      );
    });
    return () => {
      stopProfile?.();
      stopAuth();
    };
  },
};
