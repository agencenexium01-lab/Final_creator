import { create } from 'zustand';
import type { UserProfile } from '../types';

type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

interface AppState {
  status: AuthStatus;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  patchUser: (updates: Partial<UserProfile>) => void;
}

// Pas de persistance locale : le profil (et donc le solde) vient toujours de Firestore,
// en temps réel. Un solde affiché ne peut pas être périmé.
export const useAppStore = create<AppState>()((set) => ({
  status: 'loading',
  user: null,
  setUser: (user) => set({ user, status: user ? 'signedIn' : 'signedOut' }),
  patchUser: (updates) => set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),
}));
