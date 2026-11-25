import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ to = '/', className, compact = false }: { to?: string; className?: string; compact?: boolean }) {
  return (
    <Link to={to} className={cn('inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7C3AED]', className)}>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#7C3AED]" aria-hidden="true">
        <Zap className="h-4 w-4 fill-white text-white" />
      </span>
      {!compact && <span className="text-base font-semibold tracking-tight text-white">Creator Booster</span>}
      <span className="sr-only">Creator Booster IA, accueil</span>
    </Link>
  );
}
