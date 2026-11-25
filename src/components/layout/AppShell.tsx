import type { ReactNode } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Clapperboard, Magnet, Lightbulb, History, Wallet,
  BookOpen, LifeBuoy, Settings, LogOut, UserRound,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { useAppStore } from '@/stores/appStore';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';

const MAIN = [
  { to: '/dashboard', label: 'Accueil', icon: LayoutDashboard },
  { to: '/tools/calendar', label: 'Calendrier 30 jours', icon: CalendarDays },
  { to: '/tools/script', label: 'Script ou post', icon: Clapperboard },
  { to: '/tools/hooks', label: 'Hooks', icon: Magnet },
  { to: '/tools/ideas', label: "Banque d'idées", icon: Lightbulb },
  { to: '/history', label: 'Historique', icon: History },
];

const SECONDARY = [
  { to: '/pricing', label: 'Recharger', icon: Wallet },
  { to: '/guide', label: 'Guide du créateur', icon: BookOpen },
  { to: '/contact', label: 'Aide et contact', icon: LifeBuoy },
  { to: '/settings', label: 'Paramètres', icon: Settings },
];

/** Barre du bas sur mobile : 5 entrées maximum. */
const BOTTOM = [
  { to: '/dashboard', label: 'Accueil', icon: LayoutDashboard },
  { to: '/tools/calendar', label: 'Calendrier', icon: CalendarDays },
  { to: '/tools/script', label: 'Script', icon: Clapperboard },
  { to: '/history', label: 'Historique', icon: History },
  { to: '/settings', label: 'Compte', icon: UserRound },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]',
    isActive ? 'bg-[#1A1A2E] text-white' : 'text-[#94A3B8] hover:bg-[#12121F] hover:text-white',
  );

function CreditsBadge({ className }: { className?: string }) {
  const credits = useAppStore((s) => s.user?.credits ?? 0);
  return (
    <Link
      to="/pricing"
      className={cn(
        'inline-flex h-9 items-center gap-2 rounded-lg border border-[#2D2D5E] px-3 text-sm text-white transition-colors hover:bg-[#1A1A2E]',
        className,
      )}
      aria-label={`${credits} crédits. Recharger`}
    >
      <Wallet className="h-4 w-4 text-[#06B6D4]" aria-hidden="true" />
      <span className="tabular-nums">{credits}</span>
      <span className="text-[#94A3B8]">crédits</span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);

  const logout = async () => {
    await authService.logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-dvh bg-[#0A0A14]">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-[#0A0A14]">
        Aller au contenu
      </a>

      {/* Ordinateur : barre latérale */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-[#1E1E3A] md:flex">
        <div className="flex h-16 items-center px-5">
          <Logo to="/dashboard" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Outils">
          {MAIN.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass} end={to === '/dashboard'}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          <div className="my-3 h-px bg-[#1E1E3A]" />
          {SECONDARY.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={linkClass}>
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-3 border-t border-[#1E1E3A] p-4">
          <CreditsBadge className="w-full justify-center" />
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm text-[#94A3B8]" title={user?.email}>{user?.name}</p>
            <button
              type="button"
              onClick={logout}
              className="grid h-9 w-9 place-items-center rounded-lg text-[#94A3B8] transition-colors hover:bg-[#12121F] hover:text-white"
              aria-label="Se déconnecter"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile : barre du haut */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#1E1E3A] bg-[#0A0A14]/95 px-4 backdrop-blur md:hidden">
          <Logo to="/dashboard" />
          <CreditsBadge />
        </header>

        <main id="contenu" className="flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">
          {children}
        </main>
      </div>

      {/* Mobile : barre d'onglets */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[#1E1E3A] bg-[#0A0A14]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Navigation"
      >
        <ul className="grid grid-cols-5">
          {BOTTOM.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/dashboard'}
                className={({ isActive }) =>
                  cn('flex min-h-14 flex-col items-center justify-center gap-1 text-[11px]', isActive ? 'text-white' : 'text-[#94A3B8]')
                }
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
