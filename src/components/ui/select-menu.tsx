import { Children, isValidElement, useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { moveIndex, typeaheadIndex } from '@/lib/listbox.js';
import { cn } from '@/lib/utils';

export interface SelectMenuProps {
  id?: string;
  value: string;
  /** Même signature qu'un <select> natif : e.target.value. */
  onChange?: (e: { target: { value: string } }) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

/** Récupère les <option> passées en enfants (texte éventuellement découpé en morceaux). */
function readOptions(children: ReactNode) {
  const text = (node: ReactNode): string =>
    typeof node === 'string' || typeof node === 'number'
      ? String(node)
      : Array.isArray(node)
        ? node.map(text).join('')
        : isValidElement<{ children?: ReactNode }>(node)
          ? text(node.props.children)
          : '';
  const out: { value: string; label: string }[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement<{ value?: string; children?: ReactNode }>(child)) {
      out.push({ value: String(child.props.value ?? ''), label: text(child.props.children) });
    }
  });
  return out;
}

/**
 * Liste déroulante dessinée par le site (couleurs maîtrisées sur Windows, macOS, Linux),
 * accessible au clavier : flèches, Début/Fin, Entrée, Échap, saisie des premières lettres.
 */
export function SelectMenu({ id, value, onChange, children, className, disabled, ...aria }: SelectMenuProps) {
  const options = readOptions(children);
  const selected = options.findIndex((o) => o.value === value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selected);
  const [upward, setUpward] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: '', at: 0 });
  const listId = useId();

  const choose = (index: number) => {
    const opt = options[index];
    if (opt && opt.value !== value) onChange?.({ target: { value: opt.value } });
    setOpen(false);
  };

  const openList = () => {
    if (disabled) return;
    const rect = rootRef.current?.getBoundingClientRect();
    setUpward(!!rect && window.innerHeight - rect.bottom < 300 && rect.top > window.innerHeight - rect.bottom);
    setActive(selected >= 0 ? selected : 0);
    setOpen(true);
  };

  // Fermer au clic en dehors.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Garder l'option active visible.
  useLayoutEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.children[active]?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'PageDown', 'PageUp'].includes(e.key)) {
      e.preventDefault();
      setActive((i) => moveIndex(options.length, i, e.key));
    } else if (e.key === 'Enter' || (e.key === ' ' && !typed.current.text)) {
      e.preventDefault();
      choose(active);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'Tab') {
      setOpen(false);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const now = Date.now();
      typed.current = { text: now - typed.current.at < 700 ? typed.current.text + e.key : e.key, at: now };
      setActive((i) => typeaheadIndex(options.map((o) => o.label), typed.current.text, i));
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        aria-describedby={aria['aria-describedby']}
        aria-invalid={aria['aria-invalid']}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={cn(
          'flex w-full min-h-11 items-center justify-between gap-2 rounded-lg border border-[#2D2D5E] bg-[#1A1A2E] px-3 py-2 text-left text-base text-white transition-colors',
          'focus-visible:border-[#7C3AED] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]/40 aria-[invalid=true]:border-red-400 disabled:opacity-50',
          className,
        )}
      >
        <span className={cn('truncate', selected < 0 && 'text-[#64748B]')}>{selected >= 0 ? options[selected].label : 'Choisir'}</span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-[#94A3B8] transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          className={cn(
            'absolute inset-x-0 z-50 max-h-72 overflow-y-auto rounded-xl border border-[#2D2D5E] bg-[#12121F] p-1 shadow-[0_12px_32px_rgba(0,0,0,0.5)]',
            upward ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {options.map((o, i) => (
            <li
              key={o.value || i}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === selected}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(i)}
              className={cn(
                'flex min-h-10 cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-[15px]',
                i === active ? 'bg-[#1E1E3A] text-white' : 'text-[#CBD5E1]',
              )}
            >
              <span>{o.label}</span>
              {i === selected && <Check className="h-4 w-4 shrink-0 text-[#A78BFA]" aria-hidden="true" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
