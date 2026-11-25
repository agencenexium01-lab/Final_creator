import { create } from 'zustand';
import type { UserProfile } from '../types';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AppState {
  status: AuthStatus;
  user: UserProfile | null;
  /** Connecté à Firebase mais profil illisible (réseau, règles) : affiché au lieu d'un chargement sans fin. */
  profileError: boolean;
  /** Session Firebase ouverte, profil pas encore reçu : les pages protégées attendent au lieu de rediriger. */
  profilePending: boolean;
  setProfilePending: (value: boolean) => void;
  setUser: (user: UserProfile | null) => void;
  setProfileError: (value: boolean) => void;
  patchUser: (updates: Partial<UserProfile>) => void;
}

// Pas de persistance locale : le profil (et donc le solde) vient toujours de Firestore,
// en temps réel. Un solde affiché ne peut pas être périmé.
export const useAppStore = create<AppState>()((set) => ({
  status: 'loading',
  user: null,
  profileError: false,
  profilePending: false,
  setProfilePending: (profilePending) => set({ profilePending }),
  setUser: (user) => set({ user, status: user ? 'signedIn' : 'signedOut', profileError: false, profilePending: false }),
  setProfileError: (profileError) => set({ profileError }),
  patchUser: (updates) => set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),
}));
