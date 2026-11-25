import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, NavLink, useLocation, useParams } from 'react-router-dom';
import { Loader2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppShell } from '@/components/layout/AppShell';
import { Field, NativeSelect, TextArea, TextInput } from '@/components/ui/field';
import { GenerationView, type ScriptPrefill } from '@/components/generation/GenerationView';
import { NICHE_OPTIONS, PLATFORM_OPTIONS, TOOLS, getTool, plural, type Platform, type ToolId } from '@/config/ui';
import { DURATIONS, TONES } from '@/shared/catalog.js';
import { FIELD_LIMITS } from '@/shared/generation.js';
import { apiService, ApiError } from '@/services/api';
import { useAppStore } from '@/stores/appStore';
import type { GenerationOutput } from '@/types';
import { cn } from '@/lib/utils';

const CUSTOM = '__custom__';

interface FormState {
  niche: string;
  customNiche: string;
  platform: Platform;
  tone: string;
  topic: string;
  hook: string;
  message: string;
  duration: string;
}

const TOPIC_LABEL: Partial<Record<ToolId, { label: string; placeholder: string }>> = {
  hooks: { label: 'Sujet de la vidéo', placeholder: 'Ex. comment j’ai trouvé mes 10 premiers clients' },
  script: { label: 'Sujet', placeholder: 'Ex. le vrai prix d’un jus fait maison' },
  ideas: { label: 'Thème', placeholder: 'Ex. la rentrée scolaire, la Saint-Valentin' },
};

export default function ToolsPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = getTool(toolId);
  const location = useLocation();
  const user = useAppStore((s) => s.user);
  const patchUser = useAppStore((s) => s.patchUser);
  const resultRef = useRef<HTMLDivElement>(null);

  const initialNiche = user?.niche ?? '';
  const nicheIsListed = !initialNiche || NICHE_OPTIONS.some((n) => n.id === initialNiche);

  const [form, setForm] = useState<FormState>(() => ({
    niche: nicheIsListed ? initialNiche : CUSTOM,
    customNiche: nicheIsListed ? '' : initialNiche,
    platform: user?.platform ?? 'both',
    tone: TONES[0],
    topic: '',
    hook: '',
    message: '',
    duration: '60 sec',
  }));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<GenerationOutput | null>(null);

  // Pré-remplissage depuis un jour du calendrier ou une idée.
  useEffect(() => {
    const prefill = (location.state as { prefill?: ScriptPrefill } | null)?.prefill;
    setResult(null);
    setError('');
    if (prefill) {
      setForm((f) => ({
        ...f,
        hook: prefill.hook ?? f.hook,
        topic: prefill.topic ?? f.topic,
        platform: prefill.platform === 'facebook' || prefill.platform === 'tiktok' ? prefill.platform : f.platform,
      }));
    }
  }, [toolId, location.state]);

  const credits = user?.credits ?? 0;
  const enough = tool ? credits >= tool.cost : false;
  const niche = form.niche === CUSTOM ? form.customNiche.trim() : form.niche;

  const params = useMemo(() => {
    if (!tool) return {};
    const p: Record<string, string> = { niche, platform: form.platform, tone: form.tone };
    if (tool.id !== 'calendar') p.topic = form.topic;
    if (tool.id === 'script') {
      p.hook = form.hook;
      p.duration = form.duration;
    }
    if (tool.id === 'script' || tool.id === 'ideas' || tool.id === 'calendar') p.message = form.message;
    return p;
  }, [tool, niche, form]);

  if (!tool) return <Navigate to="/dashboard" replace />;

  const set = <K extends keyof FormState>(key: K) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !enough) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await apiService.generate(tool.id, params);
      setResult(res.result);
      patchUser({ credits: res.credits });
      toast.success(`C’est prêt. ${plural(tool.cost, 'crédit')} utilisé${tool.cost > 1 ? 's' : ''}.`);
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'La génération a échoué. Réessaie dans un instant.');
    } finally {
      setLoading(false);
    }
  };

  const topic = TOPIC_LABEL[tool.id];

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Outils" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
          {TOOLS.map((t) => (
            <NavLink
              key={t.id}
              to={`/tools/${t.id}`}
              className={({ isActive }) =>
                cn(
                  'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm transition-colors',
                  isActive ? 'border-[#7C3AED] bg-[#17142B] text-white' : 'border-[#1E1E3A] text-[#94A3B8] hover:text-white',
                )
              }
            >
              <t.icon className="h-4 w-4" aria-hidden="true" />
              {t.short}
              <span className="tabular-nums text-xs text-[#64748B]">{t.cost}</span>
            </NavLink>
          ))}
        </nav>

        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{tool.title}</h1>
          <p className="mt-1 text-[#94A3B8]">{tool.description}</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <form onSubmit={generate} className="h-fit space-y-4 rounded-2xl border border-[#1E1E3A] bg-[#12121F] p-5 lg:sticky lg:top-6">
            <Field id="niche" label="Niche">
              <NativeSelect value={form.niche} onChange={set('niche')}>
                <option value="">Généraliste</option>
                {NICHE_OPTIONS.map((n) => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
                <option value={CUSTOM}>Autre (je l’écris)</option>
              </NativeSelect>
            </Field>
            {form.niche === CUSTOM && (
              <Field id="customNiche" label="Ta niche">
                <TextInput value={form.customNiche} onChange={set('customNiche')} maxLength={FIELD_LIMITS.niche} placeholder="Ex. coiffure afro à Abidjan" />
              </Field>
            )}

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-white">Plateforme</legend>
              <div className="grid grid-cols-3 gap-2">
                {PLATFORM_OPTIONS.map((p) => (
                  <label
                    key={p.id}
                    className={cn(
                      'flex min-h-11 cursor-pointer items-center justify-center rounded-lg border text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#7C3AED]',
                      form.platform === p.id ? 'border-[#7C3AED] bg-[#17142B] text-white' : 'border-[#2D2D5E] text-[#94A3B8] hover:text-white',
                    )}
                  >
                    <input type="radio" name="platform" value={p.id} checked={form.platform === p.id} onChange={() => setForm((f) => ({ ...f, platform: p.id }))} className="sr-only" />
                    {p.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <Field id="tone" label="Ton">
              <NativeSelect value={form.tone} onChange={set('tone')}>
                {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            {tool.id === 'script' && (
              <Field id="hook" label="Hook de départ" optional hint="Colle un hook, ou laisse vide pour que l’IA l’écrive.">
                <TextArea value={form.hook} onChange={set('hook')} maxLength={FIELD_LIMITS.hook} rows={2} />
              </Field>
            )}

            {topic && (
              <Field id="topic" label={topic.label} optional>
                <TextInput value={form.topic} onChange={set('topic')} maxLength={FIELD_LIMITS.topic} placeholder={topic.placeholder} />
              </Field>
            )}

            {tool.id === 'script' && form.platform !== 'facebook' && (
              <Field id="duration" label="Durée de la vidéo">
                <NativeSelect value={form.duration} onChange={set('duration')}>
                  {DURATIONS.map((d) => <option key={d} value={d}>{d.replace('sec', 'secondes')}</option>)}
                </NativeSelect>
              </Field>
            )}

            {(tool.id === 'script' || tool.id === 'ideas' || tool.id === 'calendar') && (
              <Field
                id="message"
                label={tool.id === 'script' ? 'Message principal' : 'Ton contexte'}
                optional
                hint={tool.id === 'script' ? 'Ce que la vidéo doit faire comprendre.' : 'Ton offre, ta cible, ce que tu veux mettre en avant ce mois-ci.'}
              >
                <TextArea value={form.message} onChange={set('message')} maxLength={FIELD_LIMITS.message} rows={3} />
              </Field>
            )}

            <div className="flex items-center justify-between rounded-lg border border-[#1E1E3A] px-3 py-2 text-sm">
              <span className="text-[#94A3B8]">Coût</span>
              <span className="tabular-nums text-white">{plural(tool.cost, 'crédit')} · solde {credits}</span>
            </div>

            {enough ? (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] font-medium text-white transition-colors hover:bg-[#6D28D9] disabled:opacity-60"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {loading ? 'Génération en cours…' : `Générer (${plural(tool.cost, 'crédit')})`}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-[#94A3B8]">
                  Il te manque {plural(tool.cost - credits, 'crédit')} pour cet outil.
                </p>
                <Link to="/pricing" className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white font-medium text-[#0A0A14] hover:bg-[#E2E8F0]">
                  <Wallet className="h-4 w-4" aria-hidden="true" /> Recharger mes crédits
                </Link>
              </div>
            )}
          </form>

          <section ref={resultRef} aria-live="polite" aria-busy={loading} className="min-w-0 scroll-mt-20">
            {error && (
              <p role="alert" className="mb-4 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}
            {loading ? (
              <div className="space-y-3">
                <p className="text-sm text-[#94A3B8]">
                  L’IA écrit ton contenu. {tool.id === 'calendar' ? 'Le calendrier prend 20 à 40 secondes.' : 'Compte 10 à 20 secondes.'}
                </p>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-28 animate-pulse rounded-xl border border-[#1E1E3A] bg-[#12121F]" />
                ))}
              </div>
            ) : result ? (
              <GenerationView tool={tool.id} output={result} pdfTitle={`Calendrier 30 jours${niche ? ` - ${niche}` : ''}`} />
            ) : (
              <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-[#2D2D5E] p-8 text-center">
                <div>
                  <tool.icon className="mx-auto h-6 w-6 text-[#64748B]" aria-hidden="true" />
                  <p className="mt-3 text-white">Le résultat s’affichera ici.</p>
                  <p className="mt-1 text-sm text-[#94A3B8]">Tout est enregistré dans ton historique.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AppShell>
  );
}
