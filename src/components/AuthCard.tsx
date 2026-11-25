import type { ReactNode } from 'react';
import { Logo } from '@/components/brand/Logo';

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-[#0A0A14] px-4 py-8 text-white">
      <div className="mx-auto w-full max-w-md">
        <Logo />
      </div>
      <main id="contenu" className="flex flex-1 items-center justify-center py-8">
        <div className="w-full max-w-md rounded-2xl border border-[#1E1E3A] bg-[#12121F] p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-[#94A3B8]">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 border-t border-[#1E1E3A] pt-5 text-center text-sm text-[#94A3B8]">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

/** Navigateurs intégrés de TikTok, Facebook, Instagram : Google y refuse la connexion. */
function isInAppBrowser() {
  return typeof navigator !== 'undefined' && /FBAN|FBAV|FB_IAB|Instagram|musical_ly|Bytedance|TikTok/i.test(navigator.userAgent);
}

export function GoogleButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: ReactNode }) {
  if (isInAppBrowser()) {
    return (
      <p className="rounded-xl border border-[#2D2D5E] bg-[#0E0E1A] p-4 text-sm text-[#CBD5E1]">
        Tu as ouvert ce lien depuis TikTok ou Facebook : Google y bloque la connexion. Ouvre la page dans Chrome
        (menu « … » puis « Ouvrir dans le navigateur »), ou utilise ton e-mail ci-dessous.
      </p>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-white font-medium text-[#1F1F1F] transition-colors hover:bg-[#F1F5F9] disabled:opacity-60"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09A6.6 6.6 0 0 1 5.49 12c0-.73.13-1.43.35-2.09V7.07H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.95 10.95 0 0 0 12 1 11 11 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
      </svg>
      {children}
    </button>
  );
}

export function Divider() {
  return (
    <div className="my-5 flex items-center gap-3 text-sm text-[#64748B]">
      <span className="h-px flex-1 bg-[#1E1E3A]" />
      ou
      <span className="h-px flex-1 bg-[#1E1E3A]" />
    </div>
  );
}

/** N'accepte que les chemins internes, pour éviter les redirections vers un autre site. */
export function safeNext(next: string | null, fallback = '/dashboard') {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : fallback;
}

export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cet e-mail. Connecte-toi.';
    case 'auth/invalid-email':
      return 'Adresse e-mail invalide.';
    case 'auth/weak-password':
      return 'Mot de passe trop faible : 8 caractères minimum.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou mot de passe incorrect.';
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Patiente quelques minutes.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Connexion Google annulée.';
    case 'auth/popup-blocked':
      return 'Ton navigateur a bloqué la fenêtre Google. Autorise les pop-ups et réessaie.';
    case 'auth/network-request-failed':
      return 'Connexion impossible. Vérifie ton accès à Internet.';
    default:
      return 'Une erreur est survenue. Réessaie.';
  }
}
