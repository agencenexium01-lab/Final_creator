import type { ReactNode } from 'react';
import { useAppStore } from '@/stores/appStore';
import { AppShell } from './AppShell';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';

/** Page publique : dans l'app si l'utilisateur est connecté, sinon avec l'en-tête et le pied du site. */
export function SiteLayout({ children }: { children: ReactNode }) {
  const status = useAppStore((s) => s.status);
  if (status === 'signedIn') return <AppShell>{children}</AppShell>;
  return (
    <div className="flex min-h-dvh flex-col bg-[#0A0A14] text-white">
      <PublicHeader />
      <main id="contenu" className="flex-1 px-4 py-10 md:py-16">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="mb-1 text-sm text-[#94A3B8]">{eyebrow}</p>}
        <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[#94A3B8]">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
