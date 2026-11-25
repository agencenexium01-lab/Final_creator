// Exemples de résultats affichés sur la page d'accueil (section « Aperçu »).
// Scénario : Mariam, vend des jus naturels à Cotonou, publie sur TikTok.
// Ce sont des exemples représentatifs du format livré, présentés comme tels sur le site.
import type { CalendarDay, HookResult, IdeaResult, ScriptResult } from '@/types';

export const SAMPLE_PERSONA = 'Mariam, vendeuse de jus naturels à Cotonou, publie sur TikTok';

export const SAMPLE_CALENDAR: CalendarDay[] = [
  { day: 1, date: '2026-12-01', idea: 'Qui je suis et pourquoi j’ai quitté mon bureau pour vendre des jus', hook: 'Il y a deux ans, je pressais des oranges dans ma cuisine à 5 h du matin.', format: 'Face caméra', platform: 'tiktok' },
  { day: 2, date: '2026-12-02', idea: 'Une journée au marché Dantokpa pour choisir mes fruits', hook: 'Voici comment je reconnais un ananas sucré sans le goûter.', format: 'Vlog', platform: 'tiktok' },
  { day: 3, date: '2026-12-03', idea: 'Les 3 erreurs qui font tourner un jus de bissap en un jour', hook: 'Si ton bissap a un goût de vinaigre le lendemain, c’est l’erreur numéro 2.', format: 'Liste', platform: 'tiktok' },
  { day: 4, date: '2026-12-04', idea: 'Avant / après : ma première bouteille et celle d’aujourd’hui', hook: 'Ma toute première étiquette était écrite au stylo.', format: 'Avant/après', platform: 'tiktok' },
  { day: 5, date: '2026-12-05', idea: 'Recette du jus gingembre-citron que mes clients redemandent', hook: 'Le jus qui a fait revenir 40 clients en une semaine.', format: 'Tutoriel', platform: 'tiktok' },
  { day: 6, date: '2026-12-06', idea: 'Réponse au commentaire « c’est trop cher »', hook: 'On m’a dit que 500 F le jus, c’est du vol. Faisons le calcul ensemble.', format: 'Réaction', platform: 'tiktok' },
];

export const SAMPLE_SCRIPT: ScriptResult = {
  title: 'Le calcul du prix d’un jus à 500 F',
  platform: 'tiktok',
  sections: [
    { id: 'hook', label: 'Accroche (0-3 s)', content: 'On m’a dit que 500 F le jus, c’est du vol. Faisons le calcul ensemble.', visual_note: 'Gros plan, bouteille en main, texte à l’écran : « 500 F = du vol ? »' },
    { id: 'context', label: 'Contexte', content: 'Pour une bouteille, il me faut trois citrons, un gros morceau de gingembre, du sucre de canne et une bouteille propre.', visual_note: 'Plan large sur la table, chaque ingrédient posé un par un' },
    { id: 'message', label: 'Message principal', content: 'Ingrédients : 230 F. Bouteille et étiquette : 120 F. Il me reste 150 F pour mon temps, le transport et le courant du congélateur.', visual_note: 'Chiffres qui s’additionnent à l’écran' },
    { id: 'twist', label: 'Twist', content: 'Et le jour où il y a délestage toute la journée, je jette tout. Ce jour-là, je perds de l’argent.', visual_note: 'Congélateur ouvert, lumière éteinte' },
    { id: 'cta', label: "Appel à l'action", content: 'Toi, tu le paierais combien ? Dis-le en commentaire, je réponds à tout le monde.', visual_note: 'Retour face caméra, sourire' },
  ],
  caption: 'Le vrai prix d’un jus fait maison. Tu en penses quoi ?',
  hashtags: ['#Cotonou', '#JusNaturel', '#Entrepreneuriat', '#Bénin'],
};

export const SAMPLE_HOOKS: HookResult[] = [
  { hook: 'Le jus qui a fait revenir 40 clients en une semaine.', framework: 'Preuve chiffrée', platform: 'tiktok', score: 9, justification: 'Un résultat concret et vérifiable donne envie de connaître la recette.' },
  { hook: 'Arrête de mettre ton bissap au frigo tout de suite après l’avoir fait.', framework: 'Contre-intuition', platform: 'tiktok', score: 8, justification: 'Contredit une habitude courante : on reste pour savoir pourquoi.' },
  { hook: 'J’ai gagné plus en vendant des jus qu’à mon ancien poste. Voici mes chiffres.', framework: 'Transparence', platform: 'facebook', score: 8, justification: 'Les chiffres personnels créent la curiosité et la confiance.' },
  { hook: 'Trois fruits du marché qu’on t’a appris à mal choisir.', framework: 'Erreur courante', platform: 'tiktok', score: 7, justification: 'Concerne tout le monde, mais reste un peu générique.' },
];

export const SAMPLE_IDEAS: IdeaResult[] = [
  { title: 'Je teste les jus de trois vendeuses du quartier, à l’aveugle', description: 'Dégustation filmée, note sur 10, sans dire lequel est le mien avant la fin.', format: 'Défi', platform: 'tiktok' },
  { title: 'Combien coûte vraiment la création d’une petite marque de jus', description: 'Le budget de départ ligne par ligne : bouteilles, étiquettes, congélateur, autorisations.', format: 'Post texte', platform: 'facebook' },
  { title: 'Ce que je fais des pelures et des restes de fruits', description: 'Compost, savon, sirop : rien ne se perd, et c’est un argument de vente.', format: 'Tutoriel', platform: 'tiktok' },
  { title: 'Ma cliente la plus fidèle raconte comment elle m’a trouvée', description: 'Micro-interview de 30 secondes devant l’étal.', format: 'Micro-trottoir', platform: 'tiktok' },
];
