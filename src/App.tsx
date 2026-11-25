import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Analytics } from '@vercel/analytics/react';
import { Loader2 } from 'lucide-react';
import { useAppStore } from './stores/appStore';
import { authService } from './services/authService';
import { auth } from './services/firebase';
import LandingPage from './pages/LandingPage';

// Pages chargées à la demande : la page d'accueil reste légère.
const SignupPage = lazy(() => import('./pages/SignupPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const GuidePage = lazy(() => import('./pages/GuidePage'));
const TermsPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.TermsPage })));
const PrivacyPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.PrivacyPage })));
const NotFoundPage = lazy(() => import('./pages/LegalPages').then((m) => ({ default: m.NotFoundPage })));

function FullScreenLoader() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#0A0A14]" aria-busy="true">
      <Loader2 className="h-6 w-6 animate-spin text-[#94A3B8]" aria-label="Chargement" />
    </div>
  );
}

/** Remonte en haut à chaque page, ou défile jusqu'à l'ancre (#apercu). */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

/** Titres d'onglet par page (référencement et historique du navigateur). */
const TITLES: Record<string, string> = {
  '/': 'Creator Booster IA · Ton mois de contenu TikTok et Facebook en une minute',
  '/pricing': 'Tarifs · Creator Booster IA',
  '/guide': 'Guide du créateur · Creator Booster IA',
  '/contact': 'Aide et contact · Creator Booster IA',
  '/conditions': 'Conditions générales · Creator Booster IA',
  '/confidentialite': 'Confidentialité · Creator Booster IA',
  '/login': 'Connexion · Creator Booster IA',
  '/signup': 'Créer un compte · Creator Booster IA',
};
function TitleManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = TITLES[pathname] ?? 'Creator Booster IA';
  }, [pathname]);
  return null;
}

function ProfileError() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[#0A0A14] px-4 text-center text-white">
      <div>
        <h1 className="text-xl font-medium">Impossible de charger ton compte</h1>
        <p className="mt-2 text-[#94A3B8]">Vérifie ta connexion Internet, puis réessaie.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="min-h-11 rounded-xl bg-white px-5 font-medium text-[#0A0A14]">Réessayer</button>
          <button type="button" onClick={() => authService.logout()} className="min-h-11 rounded-xl border border-[#2D2D5E] px-5 text-white">Se déconnecter</button>
        </div>
      </div>
    </div>
  );
}

function RequireAuth({ children, allowIncomplete = false }: { children: ReactNode; allowIncomplete?: boolean }) {
  const { status, user, profileError } = useAppStore();
  const location = useLocation();
  if (profileError && !user) return <ProfileError />;
  // Connecté côté Firebase mais profil pas encore reçu : on attend au lieu de renvoyer vers la connexion.
  if (status === 'loading' || (status === 'signedOut' && auth.currentUser)) return <FullScreenLoader />;
  if (status === 'signedOut' || !user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (!allowIncomplete && !user.onboarding_completed) {
    return <Navigate to={`/onboarding?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }
  if (allowIncomplete && user.onboarding_completed && location.pathname === '/onboarding') {
    const next = new URLSearchParams(location.search).get('next');
    return <Navigate to={next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'} replace />;
  }
  return <>{children}</>;
}

/** Pages de connexion : un utilisateur déjà connecté va directement à son espace. */
function GuestOnly({ children }: { children: ReactNode }) {
  const status = useAppStore((s) => s.status);
  const location = useLocation();
  if (status === 'signedIn') {
    const next = new URLSearchParams(location.search).get('next');
    return <Navigate to={next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard'} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const setUser = useAppStore((s) => s.setUser);
  const setProfileError = useAppStore((s) => s.setProfileError);

  useEffect(() => authService.watchSession(setUser, () => setProfileError(true)), [setUser, setProfileError]);

  return (
    <BrowserRouter>
      <ScrollManager />
      <TitleManager />
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/recharge-credits" element={<Navigate to="/pricing" replace />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/conditions" element={<TermsPage />} />
          <Route path="/confidentialite" element={<PrivacyPage />} />

          <Route path="/signup" element={<GuestOnly><SignupPage /></GuestOnly>} />
          <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route path="/onboarding" element={<RequireAuth allowIncomplete><OnboardingPage /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
          <Route path="/tools/:toolId" element={<RequireAuth><ToolsPage /></RequireAuth>} />
          <Route path="/history" element={<RequireAuth><HistoryPage /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Toaster
        position="top-center"
        toastOptions={{ duration: 4000, style: { background: '#12121F', color: '#F1F5F9', border: '1px solid #1E1E3A' } }}
      />
      <Analytics />
    </BrowserRouter>
  );
}
