import { useNavigate } from 'react-router-dom';
import { ArrowRight, Download } from 'lucide-react';
import type { CalendarDay, GenerationOutput, HookResult, IdeaResult, ScriptResult, ToolId } from '@/types';
import { CopyButton } from './CopyButton';
import { calendarToText, exportCalendarPdf, formatDate, scriptToText } from './export';
import { cn } from '@/lib/utils';

const card = 'rounded-xl border border-[#1E1E3A] bg-[#12121F]';
const platformName = (p: string) => (p === 'facebook' ? 'Facebook' : 'TikTok');

export interface ScriptPrefill {
  hook?: string;
  topic?: string;
  platform?: string;
}

interface Props {
  tool: ToolId;
  output: GenerationOutput | null;
  /** Mode aperçu : pas d'actions (landing). */
  preview?: boolean;
  /** Limite le nombre d'éléments affichés (aperçu). */
  limit?: number;
  pdfTitle?: string;
}

export function GenerationView({ tool, output, preview = false, limit, pdfTitle = 'Calendrier 30 jours' }: Props) {
  if (!output) return <p className="text-sm text-[#94A3B8]">Aucun contenu enregistré pour cette génération.</p>;

  // Anciens calendriers enregistrés en texte brut.
  if (typeof output === 'string') {
    return (
      <div className="space-y-3">
        {!preview && <CopyButton text={output} label="Tout copier" />}
        <pre className={cn(card, 'whitespace-pre-wrap p-4 font-sans text-sm leading-relaxed text-[#E2E8F0]')}>{output}</pre>
      </div>
    );
  }

  if (tool === 'calendar' && 'days' in output) return <CalendarView days={output.days} preview={preview} limit={limit} pdfTitle={pdfTitle} />;
  if (tool === 'script' && 'sections' in output) return <ScriptView script={output} preview={preview} />;
  if (tool === 'hooks' && 'hooks' in output) return <HooksView hooks={output.hooks} preview={preview} limit={limit} />;
  if (tool === 'ideas' && 'ideas' in output) return <IdeasView ideas={output.ideas} preview={preview} limit={limit} />;
  return <p className="text-sm text-[#94A3B8]">Format de contenu non reconnu.</p>;
}

function CalendarView({ days, preview, limit, pdfTitle }: { days: CalendarDay[]; preview: boolean; limit?: number; pdfTitle: string }) {
  const navigate = useNavigate();
  const shown = limit ? days.slice(0, limit) : days;

  const writeScript = (d: CalendarDay) =>
    navigate('/tools/script', { state: { prefill: { hook: d.hook, topic: d.idea, platform: d.platform } satisfies ScriptPrefill } });

  return (
    <div className="space-y-4">
      {!preview && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => exportCalendarPdf(days, pdfTitle)}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-white px-3 text-sm font-medium text-[#0A0A14] transition-colors hover:bg-[#E2E8F0]"
          >
            <Download className="h-4 w-4" aria-hidden="true" /> Télécharger en PDF
          </button>
          <CopyButton text={calendarToText(days)} label="Tout copier" />
        </div>
      )}
      <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((d) => (
          <li key={d.day} className={cn(card, 'flex flex-col p-4')}>
            <div className="mb-2 flex items-baseline justify-between gap-2 text-xs text-[#94A3B8]">
              <span className="font-medium text-white">
                Jour {d.day}
                {d.date && <span className="ml-1.5 font-normal text-[#94A3B8]">{formatDate(d.date)}</span>}
              </span>
              <span>{d.format} · {platformName(d.platform)}</span>
            </div>
            <p className="text-[15px] leading-snug text-white">{d.idea}</p>
            <p className="mt-2 border-l-2 border-[#7C3AED] pl-3 text-sm leading-snug text-[#CBD5E1]">{d.hook}</p>
            {!preview && (
              <button
                type="button"
                onClick={() => writeScript(d)}
                className="mt-4 inline-flex items-center gap-1.5 self-start rounded-lg text-sm font-medium text-[#A78BFA] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]"
              >
                Écrire le script de ce jour <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ScriptView({ script, preview }: { script: ScriptResult; preview: boolean }) {
  return (
    <article className={cn(card, 'overflow-hidden')}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E1E3A] px-5 py-4">
        <div>
          <p className="text-xs text-[#94A3B8]">{script.platform === 'facebook' ? 'Post Facebook' : 'Script TikTok'}</p>
          <h3 className="text-lg font-medium text-white">{script.title}</h3>
        </div>
        {!preview && <CopyButton text={scriptToText(script)} label="Copier le script" />}
      </header>
      <ol className="divide-y divide-[#1E1E3A]">
        {script.sections.map((s) => (
          <li key={s.id} className="px-5 py-4">
            <h4 className="mb-1 text-sm font-medium text-[#A78BFA]">{s.label}</h4>
            <p className="whitespace-pre-wrap leading-relaxed text-white">{s.content}</p>
            {s.visual_note && <p className="mt-2 text-sm text-[#67E8F9]">À l’écran : {s.visual_note}</p>}
          </li>
        ))}
      </ol>
      {(script.caption || script.hashtags?.length) && (
        <footer className="space-y-1 border-t border-[#1E1E3A] px-5 py-4 text-sm">
          {script.caption && <p className="text-[#CBD5E1]">{script.caption}</p>}
          {script.hashtags?.length ? <p className="text-[#94A3B8]">{script.hashtags.join(' ')}</p> : null}
        </footer>
      )}
    </article>
  );
}

function HooksView({ hooks, preview, limit }: { hooks: HookResult[]; preview: boolean; limit?: number }) {
  const shown = [...(limit ? hooks.slice(0, limit) : hooks)].sort((a, b) => b.score - a.score);
  return (
    <ol className="space-y-3">
      {shown.map((h, i) => (
        <li key={i} className={cn(card, 'p-4')}>
          <div className="mb-2 flex items-center justify-between gap-3 text-xs text-[#94A3B8]">
            <span>{h.framework} · {platformName(h.platform)}</span>
            <span className="tabular-nums text-white" aria-label={`Note ${h.score} sur 10`}>
              <span className="text-base font-medium">{h.score}</span>/10
            </span>
          </div>
          <p className="text-[17px] leading-snug text-white">{h.hook}</p>
          <p className="mt-2 text-sm text-[#94A3B8]">{h.justification}</p>
          {!preview && <CopyButton text={h.hook} className="mt-3" />}
        </li>
      ))}
    </ol>
  );
}

function IdeasView({ ideas, preview, limit }: { ideas: IdeaResult[]; preview: boolean; limit?: number }) {
  const navigate = useNavigate();
  const shown = limit ? ideas.slice(0, limit) : ideas;
  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {shown.map((idea, i) => (
        <li key={i} className={cn(card, 'flex flex-col p-4')}>
          <p className="mb-1 text-xs text-[#94A3B8]">{idea.format} · {platformName(idea.platform)}</p>
          <h4 className="font-medium leading-snug text-white">{idea.title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-[#CBD5E1]">{idea.description}</p>
          {!preview && (
            <div className="mt-3 flex flex-wrap gap-2">
              <CopyButton text={`${idea.title}\n${idea.description}`} />
              <button
                type="button"
                onClick={() => navigate('/tools/script', { state: { prefill: { topic: idea.title, platform: idea.platform } satisfies ScriptPrefill } })}
                className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-[#A78BFA] hover:text-white"
              >
                En faire un script <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
