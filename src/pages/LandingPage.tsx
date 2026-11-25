import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, RotateCcw, ShieldCheck, Infinity as InfinityIcon, MessageCircle } from 'lucide-react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { VideoSlot } from '@/components/VideoSlot';
import { PricingCards } from '@/components/PricingCards';
import { GenerationView } from '@/components/generation/GenerationView';
import { DEMO_VIDEOS } from '@/config/site';
import { NICHE_OPTIONS, TOOLS, plural, type ToolId } from '@/config/ui';
import { MONTH_PLAN, PACKS, TOOL_COSTS, formatFcfa, monthCostFcfa } from '@/config/pricing';
import { FAQ } from '@/content/faq';
import { SAMPLE_CALENDAR, SAMPLE_HOOKS, SAMPLE_IDEAS, SAMPLE_PERSONA, SAMPLE_SCRIPT } from '@/content/samples';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

const SAMPLES = {
  calendar: { days: SAMPLE_CALENDAR },
  script: SAMPLE_SCRIPT,
  hooks: { hooks: SAMPLE_HOOKS },
  ideas: { ideas: SAMPLE_IDEAS },
} as const;

const STEPS = [
  { title: 'Crée ton compte', text: 'Avec Google ou ton e-mail. Choisis ta niche, ton pays et ta plateforme.' },
  { title: 'Recharge tes crédits', text: `Par Mobile Money ou carte, dès ${formatFcfa(PACKS[0].priceFcfa)}. Sans abonnement.` },
  { title: 'Lance ton calendrier', text: '30 jours de sujets, chacun avec son hook et son format, en quelques secondes.' },
  { title: 'Écris jour après jour', text: 'Un clic sur un jour du calendrier et son script est prêt à tourner ou à coller.' },
];

const cheapestMonth = Math.min(...PACKS.map(monthCostFcfa));
const dearestMonth = Math.max(...PACKS.map(monthCostFcfa));

function PrimaryCta({ className, children = 'Créer mon compte' }: { className?: string; children?: React.ReactNode }) {
  const signedIn = useAppStore((s) => s.status === 'signedIn');
  return (
    <Link
      to={signedIn ? '/tools/calendar' : '/signup'}
      className={cn(
        'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-6 text-base font-medium text-white transition-colors hover:bg-[#6D28D9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
        className,
      )}
    >
      {signedIn ? 'Planifier mon mois' : children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

function ToolPreview() {
  const [active, setActive] = useState<ToolId>('calendar');
  const baseId = useId();
  const tool = TOOLS.find((t) => t.id === active)!;

  const onKey = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const next = (index + (e.key === 'ArrowRight' ? 1 : TOOLS.length - 1)) % TOOLS.length;
    setActive(TOOLS[next].id);
    document.getElementById(`${baseId}-tab-${TOOLS[next].id}`)?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Outils" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {TOOLS.map((t, i) => (
          <button
            key={t.id}
            id={`${baseId}-tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={active === t.id}
            aria-controls={`${baseId}-panel`}
            tabIndex={active === t.id ? 0 : -1}
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]',
              active === t.id ? 'border-[#7C3AED] bg-[#17142B] text-white' : 'border-[#1E1E3A] text-[#94A3B8] hover:text-white',
            )}
          >
            <t.icon className="h-4 w-4" aria-hidden="true" />
            {t.title}
          </button>
        ))}
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${active}`} className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium text-white">{tool.title}</h3>
            <p className="mt-1 text-[#94A3B8]">{tool.description}</p>
            <p className="mt-2 text-sm text-[#94A3B8]">
              Coût : <span className="tabular-nums text-white">{plural(tool.cost, 'crédit')}</span>
            </p>
          </div>
          <VideoSlot src={DEMO_VIDEOS[active]} title={`Voir la démo : ${tool.title}`} />
        </div>
        <div className="rounded-2xl border border-[#1E1E3A] bg-[#0E0E1A] p-4 md:p-5">
          <p className="mb-4 text-xs text-[#94A3B8]">Exemple de résultat pour : {SAMPLE_PERSONA}</p>
          <div className="max-h-[560px] overflow-y-auto pr-1">
            <GenerationView tool={active} output={SAMPLES[active]} preview limit={active === 'calendar' ? 6 : undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#0A0A14] text-white">
      <PublicHeader />

      <main id="contenu">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 md:pt-20 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)] lg:gap-12">
          <div>
            <p className="mb-4 text-sm text-[#A78BFA]">Pour les créateurs TikTok et Facebook d’Afrique francophone</p>
            <h1 className="text-[2.5rem] font-semibold leading-[1.05] tracking-tight md:text-6xl text-balance">
              Ton mois de contenu planifié en une minute.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#94A3B8]">
              30 jours de sujets, de hooks et de formats, puis un script prêt à tourner pour chaque vidéo.
              En français, avec les références de ton public.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryCta />
              <a href="#apercu" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#2D2D5E] px-6 font-medium text-white transition-colors hover:bg-[#12121F]">
                Voir un exemple
              </a>
            </div>
            <p className="mt-4 text-sm text-[#94A3B8]">
              Mobile Money ou carte · dès {formatFcfa(PACKS[0].priceFcfa)} · sans abonnement
            </p>
          </div>
          <VideoSlot src={DEMO_VIDEOS.hero} title="Regarder la démo (2 min)" />
        </section>

        {/* Le problème */}
        <section className="border-y border-[#1E1E3A] bg-[#0E0E1A] px-4 py-16 md:py-20">
          <div className="mx-auto max-w-2xl space-y-5 text-lg leading-relaxed text-[#94A3B8]">
            <p>Il est 22 h. Le trépied est installé, la lumière est bonne, le téléphone est prêt. Et tu ne sais pas quoi dire.</p>
            <p>Tu cherches une idée. Elle te paraît banale. Tu en cherches une autre. Une heure plus tard, tu n’as rien filmé.</p>
            <p>Pendant ce temps, quelqu’un publie chaque jour dans ta niche. Pas parce qu’il a plus de talent. Parce qu’il n’a jamais à se demander quoi dire.</p>
            <p className="font-medium text-white">Ce n’est pas ton talent qui te bloque. C’est de repartir de zéro chaque jour.</p>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">Quatre étapes, puis un contenu par jour</h2>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-[#1E1E3A] bg-[#12121F] p-6">
                <span className="text-sm tabular-nums text-[#A78BFA]">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-3 font-medium text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Aperçu des résultats */}
        <section id="apercu" className="scroll-mt-20 border-t border-[#1E1E3A] px-4 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">Ce que tu obtiens, outil par outil</h2>
            <p className="mt-3 max-w-2xl text-[#94A3B8]">
              Choisis un outil pour voir le format exact du résultat, et sa démo vidéo.
            </p>
            <div className="mt-10">
              <ToolPreview />
            </div>
          </div>
        </section>

        {/* Niches */}
        <section className="border-t border-[#1E1E3A] bg-[#0E0E1A] px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Toutes les niches, et la tienne</h2>
            <p className="mt-2 text-[#94A3B8]">Choisis dans la liste ou écris ta niche exacte : « coiffure afro à Abidjan », « immobilier à Dakar »…</p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {NICHE_OPTIONS.map(({ id, label, icon: Icon }) => (
                <li key={id} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#1E1E3A] bg-[#12121F] px-3 text-sm text-[#CBD5E1]">
                  <Icon className="h-4 w-4 text-[#94A3B8]" aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Tarifs */}
        <section id="tarifs" className="scroll-mt-20 mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h2 className="max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">
            Un mois de contenu = {MONTH_PLAN.credits} crédits
          </h2>
          <p className="mt-3 max-w-2xl text-[#94A3B8]">
            1 calendrier ({TOOL_COSTS.calendar} crédits) + {MONTH_PLAN.scripts} scripts ({TOOL_COSTS.script} crédits chacun).
            Selon le pack, un mois te revient entre {formatFcfa(cheapestMonth)} et {formatFcfa(dearestMonth)}.
            Hooks : {TOOL_COSTS.hooks} crédits, idées : {TOOL_COSTS.ideas} crédits.
          </p>
          <div className="mt-10">
            <PricingCards />
          </div>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#94A3B8]">Pas d’abonnement. Les crédits n’expirent jamais.</p>
            <PrimaryCta>Choisir mon pack</PrimaryCta>
          </div>
        </section>

        {/* Engagements */}
        <section className="border-t border-[#1E1E3A] px-4 py-16">
          <ul className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: RotateCcw, title: 'Crédits remboursés si ça rate', text: "Si l'IA ne renvoie pas un résultat exploitable, tes crédits reviennent automatiquement." },
              { icon: InfinityIcon, title: 'Sans abonnement', text: 'Tu paies seulement ce que tu utilises. Les crédits n’expirent pas.' },
              { icon: ShieldCheck, title: 'Paiement sécurisé', text: 'Mobile Money ou carte, sur la page de paiement de Chariow.' },
              { icon: MessageCircle, title: 'Une vraie personne répond', text: 'Une question, un souci de paiement : écris-nous sur WhatsApp.' },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <Icon className="h-5 w-5 text-[#06B6D4]" aria-hidden="true" />
                <h3 className="mt-3 font-medium text-white">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[#94A3B8]">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section className="border-t border-[#1E1E3A] bg-[#0E0E1A] px-4 py-16 md:py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Questions fréquentes</h2>
            <div className="mt-8 divide-y divide-[#1E1E3A] border-y border-[#1E1E3A]">
              {FAQ.slice(0, 5).map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-medium text-white">
                    {f.q}
                    <span className="text-[#94A3B8] transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-2 leading-relaxed text-[#94A3B8]">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Dernier appel */}
        <section className="px-4 py-20 text-center md:py-28">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
            Ton premier mois de contenu peut être prêt ce soir.
          </h2>
          <PrimaryCta className="mt-8" />
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
