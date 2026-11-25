import { Link } from 'react-router-dom';
import { Timer, Magnet, ListOrdered, CalendarCheck, Scissors } from 'lucide-react';
import { SiteLayout, PageHeader } from '@/components/layout/SiteLayout';

const SECTIONS = [
  {
    icon: Timer,
    title: 'La règle des 3 premières secondes',
    paragraphs: [
      'Les 3 premières secondes d’une vidéo, ou les 2 premières lignes d’un post, décident de la suite. TikTok regarde si les gens restent jusqu’au bout. Facebook regarde s’ils cliquent sur « Voir plus ».',
      'Ton hook doit créer tout de suite une tension, une curiosité ou une promesse que seule la suite peut résoudre.',
    ],
  },
  {
    icon: Magnet,
    title: 'Pourquoi le hook fait tes vues',
    paragraphs: [
      'Les plateformes ne montrent pas ton contenu parce qu’il est bon : elles le montrent parce que les gens restent. Plus la rétention est forte, plus la vidéo est proposée à de nouvelles personnes.',
      'Un bon hook peut sauver une vidéo moyenne. Un hook faible enterre une excellente vidéo avant qu’on la voie.',
    ],
  },
  {
    icon: ListOrdered,
    title: 'Structurer une vidéo courte',
    paragraphs: [
      'Hook, problème que ton public reconnaît, solution claire, preuve ou histoire, appel à l’action.',
      'Le problème crée l’identification, la solution l’espoir, la preuve la confiance. L’appel à l’action transforme un spectateur en abonné.',
    ],
  },
  {
    icon: CalendarCheck,
    title: 'À quel rythme publier',
    paragraphs: [
      'Au début : une vidéo par jour sur TikTok, un post par jour sur Facebook, pendant 30 jours. La régularité compte plus que la perfection.',
      'Ces 30 jours servent à trouver ton style et à montrer à l’algorithme à qui proposer tes contenus. Ensuite seulement, optimise la qualité.',
    ],
  },
  {
    icon: Scissors,
    title: 'Garder l’attention jusqu’au bout',
    paragraphs: [
      'Coupe tous les silences au montage. Ajoute des sous-titres : beaucoup de gens regardent sans le son. Commence chaque phrase par un mot fort.',
      'Relance l’attention au milieu (question, révélation), et termine par une question ouverte pour faire commenter. Sur Facebook, aère le texte et pose une seule question à la fin.',
    ],
  },
];

export default function GuidePage() {
  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl">
        <PageHeader eyebrow="Guide du créateur" title="Faire des vidéos qui retiennent l’attention" description="Les cinq règles que suivent nos calendriers et nos scripts." />
        <ol className="space-y-4">
          {SECTIONS.map(({ icon: Icon, title, paragraphs }, i) => (
            <li key={title} className="rounded-2xl border border-[#1E1E3A] bg-[#12121F] p-6">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-[#A78BFA]" aria-hidden="true" />
                <h2 className="text-lg font-medium text-white">
                  <span className="mr-2 tabular-nums text-[#64748B]">{i + 1}.</span>
                  {title}
                </h2>
              </div>
              {paragraphs.map((p) => (
                <p key={p} className="mt-3 leading-relaxed text-[#CBD5E1]">{p}</p>
              ))}
            </li>
          ))}
        </ol>
        <div className="mt-10 rounded-2xl border border-[#1E1E3A] p-6">
          <p className="text-white">Prêt à appliquer tout ça sans y passer tes soirées ?</p>
          <Link to="/tools/calendar" className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-[#7C3AED] px-5 font-medium text-white hover:bg-[#6D28D9]">
            Planifier mon mois
          </Link>
        </div>
      </article>
    </SiteLayout>
  );
}
