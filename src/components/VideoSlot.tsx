import { useState } from 'react';
import { Play, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoSlotProps {
  src: string;
  title: string;
  className?: string;
}

/**
 * Vidéo chargée seulement au clic (pas de lecteur lourd au chargement de la page).
 * Sans URL : emplacement réservé de la bonne taille.
 */
export function VideoSlot({ src, title, className }: VideoSlotProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={cn('relative aspect-video w-full overflow-hidden rounded-2xl border border-[#1E1E3A] bg-[#0E0E1A]', className)}>
      {!src ? (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div>
            <Video className="mx-auto mb-3 h-6 w-6 text-[#64748B]" aria-hidden="true" />
            <p className="text-sm text-[#94A3B8]">Démo vidéo bientôt disponible</p>
          </div>
        </div>
      ) : playing ? (
        <iframe
          src={src}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_center,#1A1A2E_0%,#0E0E1A_70%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7C3AED]"
        >
          <span className="flex flex-col items-center gap-3">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white text-[#0A0A14] transition-transform duration-150 group-hover:scale-105 group-active:scale-95">
              <Play className="ml-1 h-6 w-6 fill-current" aria-hidden="true" />
            </span>
            <span className="text-sm font-medium text-white">{title}</span>
          </span>
        </button>
      )}
    </div>
  );
}
