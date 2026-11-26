// Installation sur l'écran d'accueil et partage du site.
import { useSyncExternalStore } from 'react';
import { installMethod } from './install.js';
import { SITE } from '@/config/site';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: BeforeInstallPromptEvent | null = null;
let installedNow = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

/**
 * À appeler une fois au démarrage (main.tsx) : l'événement du navigateur peut arriver
 * avant l'affichage du bouton, il faut le garder de côté.
 */
export function setupPwa() {
  if (typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // On affiche notre propre bouton au bon moment.
    deferred = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installedNow = true;
    notify();
  });
  // Service worker seulement en production : en local, il gênerait le rechargement à chaud.
  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => console.warn('Service worker non enregistré', err));
    });
  }
}

export function isStandalone() {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

function snapshot() {
  return installMethod({
    ua: typeof navigator === 'undefined' ? '' : navigator.userAgent,
    standalone: installedNow || isStandalone(),
    canPrompt: !!deferred,
  });
}

/** Méthode d'installation disponible, mise à jour quand le navigateur devient prêt. */
export function useInstallMethod() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    snapshot,
    () => 'menu' as const,
  );
}

/** Ouvre la fenêtre d'installation du navigateur. Retourne true si l'utilisateur accepte. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const event = deferred;
  deferred = null; // Un événement ne peut servir qu'une fois.
  notify();
  await event.prompt();
  const { outcome } = await event.userChoice;
  return outcome === 'accepted';
}

export const SHARE_TEXT = 'Je planifie mes contenus TikTok et Facebook avec Creator Booster IA. Regarde :';

/**
 * Partage via la feuille de partage du téléphone (WhatsApp, SMS, etc.).
 * Retourne 'shared', 'copied' (lien copié à la place) ou 'cancelled'.
 */
export async function shareSite(): Promise<'shared' | 'copied' | 'cancelled'> {
  const data = { title: SITE.name, text: SHARE_TEXT, url: SITE.url };
  if (navigator.share) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return 'cancelled';
    }
  }
  try {
    await navigator.clipboard.writeText(SITE.url);
    return 'copied';
  } catch {
    return 'cancelled';
  }
}

export const whatsappShareUrl = () => `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${SITE.url}`)}`;
