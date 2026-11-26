import { useEffect, useRef, useState } from 'react';
import { Download, Share2, X, MessageCircle, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import { promptInstall, shareSite, useInstallMethod, whatsappShareUrl } from '@/lib/pwa';
import { cn } from '@/lib/utils';

type Method = ReturnType<typeof useInstallMethod>;

const STEPS: Record<Exclude<Method, 'installed' | 'prompt'>, { title: string; steps: string[] }> = {
  ios: {
    title: 'Ajouter à l’écran d’accueil (iPhone)',
    steps: [
      'Touche le bouton Partager (le carré avec une flèche vers le haut), en bas dans Safari ou en haut dans Chrome.',
      'Fais défiler et choisis « Sur l’écran d’accueil ».',
      'Touche « Ajouter ». L’icône Creator Booster apparaît avec tes applications.',
    ],
  },
  inapp: {
    title: 'Ouvre d’abord le site dans ton navigateur',
    steps: [
      'Tu es dans le navigateur intégré de TikTok ou Facebook, qui ne permet pas d’installer d’application.',
      'Touche le menu « … » en haut à droite, puis « Ouvrir dans le navigateur » (Chrome ou Safari).',
      'Sur la page qui s’ouvre, touche à nouveau « Installer l’application ».',
    ],
  },
  menu: {
    title: 'Ajouter à l’écran d’accueil',
    steps: [
      'Ouvre le menu de ton navigateur (les trois points ⋮ en haut à droite dans Chrome).',
      'Choisis « Installer l’application » ou « Ajouter à l’écran d’accueil ».',
      'Confirme. L’icône Creator Booster apparaît avec tes applications.',
    ],
  },
};

function InstallHelp({ method, onClose }: { method: keyof typeof STEPS; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => ref.current?.showModal(), []);
  const { title, steps } = STEPS[method];
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto w-[min(100%-2rem,28rem)] rounded-2xl border border-[#1E1E3A] bg-[#0E0E1A] p-0 text-white backdrop:bg-black/70"
      aria-labelledby="install-title"
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="install-title" className="text-lg font-medium">{title}</h2>
          <button type="button" onClick={() => ref.current?.close()} className="-m-2 grid h-10 w-10 place-items-center rounded-lg text-[#94A3B8] hover:text-white" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>
        <ol className="mt-4 space-y-3">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-3 text-[15px] leading-relaxed text-[#CBD5E1]">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#1E1E3A] text-xs tabular-nums text-white">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => ref.current?.close()} className="mt-6 min-h-11 w-full rounded-xl bg-white font-medium text-[#0A0A14]">
          J’ai compris
        </button>
      </div>
    </dialog>
  );
}

const buttonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]';

/** Bouton « Installer l'application » : un clic si le navigateur le permet, sinon instructions. Masqué si déjà installée. */
export function InstallButton({ className }: { className?: string }) {
  const method = useInstallMethod();
  const [help, setHelp] = useState<keyof typeof STEPS | null>(null);
  if (method === 'installed') return null;

  const onClick = async () => {
    if (method === 'prompt') {
      if (await promptInstall()) toast.success('Creator Booster est sur ton écran d’accueil.');
    } else {
      setHelp(method);
    }
  };

  return (
    <>
      <button type="button" onClick={onClick} className={cn(buttonClass, 'bg-white text-[#0A0A14] hover:bg-[#E2E8F0]', className)}>
        <Download className="h-4 w-4" aria-hidden="true" /> Installer l’application
      </button>
      {help && <InstallHelp method={help} onClose={() => setHelp(null)} />}
    </>
  );
}

/** Bouton « Partager le site » : feuille de partage du téléphone, sinon lien copié. */
export function ShareButton({ className }: { className?: string }) {
  const onClick = async () => {
    const result = await shareSite();
    if (result === 'copied') toast.success('Lien du site copié. Colle-le dans WhatsApp ou un SMS.');
  };
  return (
    <button type="button" onClick={onClick} className={cn(buttonClass, 'border border-[#2D2D5E] text-white hover:bg-[#12121F]', className)}>
      <Share2 className="h-4 w-4" aria-hidden="true" /> Partager le site
    </button>
  );
}

/** Bloc complet : installer, partager, envoyer par WhatsApp. */
export function ShareInstallPanel({ className }: { className?: string }) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-3', className)}>
      <InstallButton className="w-full" />
      <ShareButton className="w-full" />
      <a
        href={whatsappShareUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonClass, 'w-full border border-[#2D2D5E] text-white hover:bg-[#12121F]')}
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" /> Envoyer sur WhatsApp
      </a>
    </div>
  );
}

const DISMISS_KEY = 'cb-install-banner-dismissed';

/** Bandeau mobile du tableau de bord : propose l'installation, peut être fermé définitivement. */
export function InstallBanner() {
  const method = useInstallMethod();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });
  if (dismissed || method === 'installed') return null;

  const close = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* navigation privée : le bandeau reviendra, sans gravité */
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-[#2D2D5E] bg-[#12121F] p-4 md:hidden">
      <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-[#A78BFA]" aria-hidden="true" />
      <div className="flex-1">
        <p className="font-medium text-white">Garde Creator Booster sous la main</p>
        <p className="mt-1 text-sm text-[#94A3B8]">Ajoute-le à ton écran d’accueil : il s’ouvrira comme une application.</p>
        <InstallButton className="mt-3 min-h-10" />
      </div>
      <button type="button" onClick={close} className="-m-2 grid h-10 w-10 place-items-center rounded-lg text-[#94A3B8] hover:text-white" aria-label="Masquer ce message">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
