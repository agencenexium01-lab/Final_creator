import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Loader2, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/SiteLayout';
import { GenerationView } from '@/components/generation/GenerationView';
import { getTool } from '@/config/ui';
import { nicheLabel } from '@/shared/catalog.js';
import { historyService } from '@/services/historyService';
import type { Generation } from '@/types';

function formatWhen(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function summary(g: Generation): string {
  const o = g.output;
  if (!o || typeof o === 'string') return '';
  if ('days' in o) return o.days[0]?.idea ?? '';
  if ('sections' in o) return o.title;
  if ('hooks' in o) return o.hooks[0]?.hook ?? '';
  if ('ideas' in o) return o.ideas[0]?.title ?? '';
  return '';
}

/** Fenêtre de lecture d'un contenu archivé (Échap ou clic hors fenêtre pour fermer). */
function GenerationDialog({ item, onClose, onDeleted }: { item: Generation; onClose: () => void; onDeleted?: (id: string) => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const tool = getTool(item.tool);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const remove = async () => {
    if (!confirm('Supprimer ce contenu de ton historique ? Cette action est définitive.')) return;
    setDeleting(true);
    try {
      await historyService.remove(item.id);
      onDeleted?.(item.id);
      onClose();
    } catch {
      toast.error('Suppression impossible. Réessaie.');
      setDeleting(false);
    }
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      className="m-auto max-h-[90dvh] w-[min(100%-2rem,56rem)] overflow-hidden rounded-2xl border border-[#1E1E3A] bg-[#0E0E1A] p-0 text-white backdrop:bg-black/70"
      aria-labelledby="dialog-title"
    >
      <div className="flex max-h-[90dvh] flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-[#1E1E3A] px-5 py-4">
          <div>
            <p className="text-xs text-[#94A3B8]">{formatWhen(item.createdAt)}{item.niche ? ` · ${nicheLabel(item.niche)}` : ''}</p>
            <h2 id="dialog-title" className="text-lg font-medium">{tool?.title ?? item.tool}</h2>
          </div>
          <button type="button" onClick={() => ref.current?.close()} className="grid h-10 w-10 place-items-center rounded-lg text-[#94A3B8] hover:bg-[#12121F] hover:text-white" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="overflow-y-auto p-5">
          <GenerationView tool={item.tool} output={item.output} />
        </div>
        {onDeleted && (
          <footer className="border-t border-[#1E1E3A] px-5 py-3">
            <button type="button" onClick={remove} disabled={deleting} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm text-red-300 hover:bg-red-400/10">
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer
            </button>
          </footer>
        )}
      </div>
    </dialog>
  );
}

export function HistoryList({ items, empty, onDeleted }: { items: Generation[] | null; empty: string; onDeleted?: (id: string) => void }) {
  const [open, setOpen] = useState<Generation | null>(null);

  if (items === null) {
    return (
      <div className="grid place-items-center py-10" aria-busy="true">
        <Loader2 className="h-6 w-6 animate-spin text-[#94A3B8]" aria-label="Chargement" />
      </div>
    );
  }
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#2D2D5E] p-8 text-center">
        <p className="text-[#94A3B8]">{empty}</p>
        <Link to="/tools/calendar" className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-white px-4 text-sm font-medium text-[#0A0A14]">
          Créer mon calendrier
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-[#1E1E3A] overflow-hidden rounded-2xl border border-[#1E1E3A] bg-[#12121F]">
        {items.map((g) => {
          const tool = getTool(g.tool);
          const Icon = tool?.icon;
          return (
            <li key={g.id}>
              <button type="button" onClick={() => setOpen(g)} className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-[#17172A] focus-visible:bg-[#17172A] focus-visible:outline-none">
                {Icon && <Icon className="h-5 w-5 shrink-0 text-[#94A3B8]" aria-hidden="true" />}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-white">{tool?.title ?? g.tool}</span>
                  <span className="block truncate text-sm text-[#94A3B8]">{summary(g) || (g.niche ? nicheLabel(g.niche) : 'Contenu archivé')}</span>
                </span>
                <span className="hidden shrink-0 text-xs text-[#64748B] sm:block">{formatWhen(g.createdAt)}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[#64748B]" aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>
      {open && <GenerationDialog item={open} onClose={() => setOpen(null)} onDeleted={onDeleted} />}
    </>
  );
}

export default function HistoryPage() {
  const [items, setItems] = useState<Generation[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    historyService
      .list(100)
      .then(setItems)
      .catch((e) => {
        console.error(e);
        setError('Impossible de charger ton historique pour le moment.');
        setItems([]);
      });
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <PageHeader title="Historique" description="Tous tes contenus générés, du plus récent au plus ancien. Les relire ne coûte aucun crédit." />
        {error && <p role="alert" className="mb-4 text-sm text-red-300">{error}</p>}
        <HistoryList items={items} empty="Aucun contenu pour l’instant." onDeleted={(id) => setItems((list) => list?.filter((g) => g.id !== id) ?? null)} />
      </div>
    </AppShell>
  );
}
