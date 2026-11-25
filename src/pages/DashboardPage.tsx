import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { TOOLS, plural } from '@/config/ui';
import { MONTH_PLAN } from '@/config/pricing';
import { nicheLabel, platformLabel } from '@/shared/catalog.js';
import { historyService } from '@/services/historyService';
import { useAppStore } from '@/stores/appStore';
import type { Generation } from '@/types';
import { SITE } from '@/config/site';
import { HistoryList } from './HistoryPage';

type PaymentState = 'idle' | 'waiting' | 'confirmed' | 'late';

/** Après un paiement : attend que le webhook ajoute les crédits (le profil est suivi en temps réel). */
function usePaymentReturn(credits: number | undefined) {
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState<PaymentState>('idle');
  const startCredits = useRef<number | null>(null);

  useEffect(() => {
    if (params.get('payment') !== 'return' || credits === undefined) return;
    startCredits.current = credits;
    setState('waiting');
    const next = new URLSearchParams(params);
    next.delete('payment');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, credits === undefined]);

  useEffect(() => {
    if (state !== 'waiting' || credits === undefined || startCredits.current === null) return;
    if (credits > startCredits.current) setState('confirmed');
  }, [credits, state]);

  useEffect(() => {
    if (state !== 'waiting') return;
    const t = setTimeout(() => setState('late'), 3 * 60 * 1000);
    return () => clearTimeout(t);
  }, [state]);

  return state;
}

export default function DashboardPage() {
  const user = useAppStore((s) => s.user);
  const payment = usePaymentReturn(user?.credits);
  const [recent, setRecent] = useState<Generation[] | null>(null);
  const [scripts, setScripts] = useState<number | null>(null);

  useEffect(() => {
    historyService.list(5).then(setRecent).catch((e) => {
      console.error(e);
      setRecent([]);
    });
    historyService.scriptsThisMonth().then(setScripts).catch(() => setScripts(null));
  }, []);

  const month = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const progress = scripts === null ? 0 : Math.min(100, Math.round((scripts / MONTH_PLAN.scripts) * 100));

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex flex-col gap-1">
          <p className="text-sm capitalize text-[#94A3B8]">{month}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">Bonjour {user?.name}</h1>
          <p className="text-sm text-[#94A3B8]">
            {user?.niche ? nicheLabel(user.niche) : 'Niche non définie'} · {platformLabel(user?.platform ?? 'both')} ·{' '}
            <Link to="/settings" className="underline underline-offset-4 hover:text-white">modifier</Link>
          </p>
        </header>

        {payment !== 'idle' && (
          <div
            role="status"
            className={
              payment === 'confirmed'
                ? 'flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-200'
                : 'flex items-start gap-3 rounded-xl border border-[#2D2D5E] bg-[#12121F] p-4 text-[#CBD5E1]'
            }
          >
            {payment === 'confirmed' ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" /> : payment === 'waiting' ? <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin" aria-hidden="true" /> : <Clock className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />}
            <p className="text-sm">
              {payment === 'confirmed' && <>Paiement confirmé. Ton solde est maintenant de <strong className="tabular-nums">{user?.credits}</strong> crédits.</>}
              {payment === 'waiting' && 'Paiement reçu, confirmation en cours. Tes crédits apparaîtront ici automatiquement, en général en moins d’une minute.'}
              {payment === 'late' && (
                <>
                  La confirmation prend plus de temps que prévu. Si ton solde ne change pas d’ici quelques minutes,{' '}
                  <a className="underline" href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer">écris-nous sur WhatsApp</a>{' '}
                  avec l’e-mail de ton compte.
                </>
              )}
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-3">
          <section className="rounded-2xl border border-[#1E1E3A] bg-[#12121F] p-5">
            <h2 className="text-sm text-[#94A3B8]">Crédits disponibles</h2>
            <p className="mt-2 text-4xl font-semibold tabular-nums text-white">{user?.credits ?? 0}</p>
            <p className="mt-1 text-sm text-[#94A3B8]">
              {user && user.credits >= MONTH_PLAN.credits
                ? 'Assez pour un mois complet.'
                : `Un mois complet demande ${MONTH_PLAN.credits} crédits.`}
            </p>
            <Link to="/pricing" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#2D2D5E] px-3 text-sm text-white hover:bg-[#1A1A2E]">
              Recharger
            </Link>
          </section>

          <section className="rounded-2xl border border-[#1E1E3A] bg-[#12121F] p-5 md:col-span-2">
            <h2 className="text-sm text-[#94A3B8]">Scripts écrits ce mois-ci</h2>
            <p className="mt-2 text-4xl font-semibold tabular-nums text-white">
              {scripts ?? '–'}
              <span className="text-xl text-[#64748B]"> / {MONTH_PLAN.scripts}</span>
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#1E1E3A]" role="progressbar" aria-valuemin={0} aria-valuemax={MONTH_PLAN.scripts} aria-valuenow={scripts ?? 0} aria-label="Scripts écrits ce mois-ci">
              <div className="h-full rounded-full bg-[#06B6D4] transition-[width] duration-500" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-3 text-sm text-[#94A3B8]">Objectif : un script par jour, soit une vidéo par jour pendant {MONTH_PLAN.scripts} jours.</p>
          </section>
        </div>

        <section aria-labelledby="outils">
          <h2 id="outils" className="mb-4 text-lg font-medium text-white">Outils</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((t) => (
              <li key={t.id}>
                <Link
                  to={`/tools/${t.id}`}
                  className="group flex h-full flex-col rounded-2xl border border-[#1E1E3A] bg-[#12121F] p-5 transition-colors hover:border-[#2D2D5E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
                >
                  <t.icon className="h-5 w-5 text-[#A78BFA]" aria-hidden="true" />
                  <h3 className="mt-3 font-medium text-white">{t.title}</h3>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-[#94A3B8]">{t.description}</p>
                  <p className="mt-4 flex items-center justify-between text-sm">
                    <span className="tabular-nums text-[#64748B]">{plural(t.cost, 'crédit')}</span>
                    <ArrowRight className="h-4 w-4 text-[#94A3B8] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="recent">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recent" className="text-lg font-medium text-white">Derniers contenus</h2>
            <Link to="/history" className="text-sm text-[#A78BFA] hover:text-white">Tout voir</Link>
          </div>
          <HistoryList items={recent} empty="Rien pour l’instant. Commence par ton calendrier de 30 jours." />
        </section>
      </div>
    </AppShell>
  );
}
