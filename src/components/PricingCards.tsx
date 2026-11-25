import { Check } from 'lucide-react';
import { PACKS, creditPriceFcfa, formatFcfa, monthCostFcfa, packCoverage, type PackId } from '@/config/pricing';
import { cn } from '@/lib/utils';

function coverageText(packId: PackId) {
  const pack = PACKS.find((p) => p.id === packId)!;
  const c = packCoverage(pack);
  if (c.months === 0) return `${c.calendars} calendrier + ${c.scripts} scripts`;
  return `${c.calendars} calendriers + ${c.scripts} scripts`;
}

function monthsText(packId: PackId) {
  const pack = PACKS.find((p) => p.id === packId)!;
  const months = pack.credits / 100;
  if (months < 1) return 'Pour démarrer et tester';
  return `Environ ${String(months).replace('.', ',')} mois de contenu quotidien`;
}

interface Props {
  selected?: PackId;
  onSelect?: (id: PackId) => void;
}

/** Cartes des packs. Cliquables seulement si `onSelect` est fourni (page Tarifs). */
export function PricingCards({ selected, onSelect }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3" role={onSelect ? 'radiogroup' : undefined} aria-label={onSelect ? 'Choix du pack' : undefined}>
      {PACKS.map((pack) => {
        const id = pack.id as PackId;
        const isSelected = selected === id;
        const content = (
          <>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="font-medium text-white">{pack.name}</h3>
              {pack.recommended && (
                <span className="rounded-md bg-[#7C3AED]/15 px-2 py-0.5 text-xs text-[#C4B5FD]">Le plus choisi</span>
              )}
            </div>
            <p className="text-3xl font-semibold tabular-nums tracking-tight text-white">{formatFcfa(pack.priceFcfa)}</p>
            <p className="mt-1 text-sm text-[#94A3B8]">
              <span className="tabular-nums text-white">{pack.credits}</span> crédits · {formatFcfa(creditPriceFcfa(pack))} le crédit
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[#CBD5E1]">
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" aria-hidden="true" />{coverageText(id)}</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" aria-hidden="true" />{monthsText(id)}</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#06B6D4]" aria-hidden="true" />Un mois complet revient à {formatFcfa(monthCostFcfa(pack))}</li>
            </ul>
          </>
        );
        const base = 'rounded-2xl border bg-[#12121F] p-6 text-left';
        return onSelect ? (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(id)}
            className={cn(
              base,
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]',
              isSelected ? 'border-[#7C3AED] bg-[#17142B]' : 'border-[#1E1E3A] hover:border-[#2D2D5E]',
            )}
          >
            {content}
          </button>
        ) : (
          <div key={id} className={cn(base, pack.recommended ? 'border-[#7C3AED]/60' : 'border-[#1E1E3A]')}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
