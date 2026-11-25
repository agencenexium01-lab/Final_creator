import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export function CopyButton({ text, label = 'Copier', className }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Copie impossible. Sélectionne le texte à la main.');
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'inline-flex min-h-9 items-center gap-2 rounded-lg border border-[#2D2D5E] px-3 text-sm text-white transition-colors hover:bg-[#1A1A2E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]',
        className,
      )}
      aria-live="polite"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-400" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      {copied ? 'Copié' : label}
    </button>
  );
}
