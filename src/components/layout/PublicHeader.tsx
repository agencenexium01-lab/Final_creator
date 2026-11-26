import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';
import { InstallButton, ShareButton } from '@/components/ShareInstall';

const LINKS = [
  { to: '/#apercu', label: 'Aperçu' },
  { to: '/pricing', label: 'Tarifs' },
  { to: '/guide', label: 'Guide' },
  { to: '/contact', label: 'Aide' },
];

export function PublicHeader() {
  const { status } = useAppStore();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const signedIn = status === 'signedIn';

  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-[#1E1E3A] bg-[#0A0A14]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className="rounded-lg px-3 py-2 text-sm text-[#94A3B8] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
            >
              {l.label}
            </NavLink>
          ))}
          <span className="mx-2 h-5 w-px bg-[#1E1E3A]" aria-hidden="true" />
          {signedIn ? (
            <Link to="/dashboard" className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#0A0A14] transition-colors hover:bg-[#E2E8F0]">
              Mon espace
            </Link>
          ) : (
            <>
              <Link to="/login" className="rounded-lg px-3 py-2 text-sm text-[#94A3B8] transition-colors hover:text-white">
                Connexion
              </Link>
              <Link to="/signup" className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#0A0A14] transition-colors hover:bg-[#E2E8F0]">
                Créer un compte
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-lg text-white md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

    </header>

      {/* Hors de l'en-tête : son backdrop-blur ferait du header la référence de ce panneau « fixed » (bug de superposition). */}
      <div
        id="menu-mobile"
        className={cn(
          'fixed inset-x-0 top-16 bottom-0 z-40 overflow-y-auto bg-[#0A0A14] px-4 pb-8 pt-4 md:hidden',
          open ? 'block' : 'hidden',
        )}
      >
        <nav className="flex flex-col" aria-label="Navigation mobile">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="border-b border-[#1E1E3A] py-4 text-lg text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 grid gap-3">
          {signedIn ? (
            <Link to="/dashboard" className="grid min-h-12 place-items-center rounded-xl bg-white font-medium text-[#0A0A14]">
              Mon espace
            </Link>
          ) : (
            <>
              <Link to="/signup" className="grid min-h-12 place-items-center rounded-xl bg-white font-medium text-[#0A0A14]">
                Créer un compte
              </Link>
              <Link to="/login" className="grid min-h-12 place-items-center rounded-xl border border-[#2D2D5E] font-medium text-white">
                Connexion
              </Link>
            </>
          )}
        </div>
        <div className="mt-8 grid gap-3 border-t border-[#1E1E3A] pt-6">
          <InstallButton className="w-full" />
          <ShareButton className="w-full" />
        </div>
      </div>
    </>
  );
}
