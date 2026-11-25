import { useState } from 'react';
import { Play, Video } from 'lucide-react';
import { toEmbed } from '@/lib/video.js';
import { cn } from '@/lib/utils';

interface VideoSlotProps {
  /** Lien de partage Google Drive ou YouTube, ou fichier vidéo (.mp4 / .webm). */
  src: string;
  title: string;
  /** Image affichée avant la lecture (facultatif). */
  poster?: string;
  className?: string;
}

/**
 * Vidéo lue sur place, sans quitter le site. Le lecteur n'est chargé qu'au clic
 * (rien de lourd au chargement de la page). Sans lien valide : emplacement réservé.
 */
export function VideoSlot({ src, title, poster, className }: VideoSlotProps) {
  const [playing, setPlaying] = useState(false);
  const embed = toEmbed(src);

  return (
    <div className={cn('relative aspect-video w-full overflow-hidden rounded-2xl border border-[#1E1E3A] bg-[#0E0E1A]', className)}>
      {!embed ? (
        <div className="absolute inset-0 grid place-items-center p-6 text-center">
          <div>
            <Video className="mx-auto mb-3 h-6 w-6 text-[#64748B]" aria-hidden="true" />
            <p className="text-sm text-[#94A3B8]">Démo vidéo bientôt disponible</p>
          </div>
        </div>
      ) : playing ? (
        embed.kind === 'file' ? (
          <video
            src={embed.src}
            poster={poster}
            title={title}
            className="absolute inset-0 h-full w-full bg-black object-contain"
            controls
            autoPlay
            playsInline
            controlsList="nodownload"
          />
        ) : (
          <>
            <iframe
              src={embed.src}
              title={title}
              className="absolute inset-0 h-full w-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              referrerPolicy="strict-origin-when-cross-origin"
            />
            {embed.kind === 'drive' && (
              // Couvre le bouton « Ouvrir dans une nouvelle fenêtre » de Google Drive (coin haut droit) :
              // le visiteur reste sur le site. Lecture, pause et plein écran restent accessibles.
              <div className="absolute right-0 top-0 h-16 w-20" aria-hidden="true" />
            )}
          </>
        )
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 grid place-items-center bg-[radial-gradient(ellipse_at_center,#1A1A2E_0%,#0E0E1A_70%)] bg-cover bg-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7C3AED]"
          style={poster ? { backgroundImage: `linear-gradient(rgb(10 10 20 / 0.35), rgb(10 10 20 / 0.35)), url(${poster})` } : undefined}
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
