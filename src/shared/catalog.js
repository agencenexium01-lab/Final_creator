// Listes métier partagées entre l'interface et le serveur.
// Les icônes sont associées côté interface (src/config/ui.tsx), pas ici.

export const NICHES = Object.freeze([
  { id: 'business', label: 'Business et motivation' },
  { id: 'entrepreneurship', label: 'Entrepreneuriat' },
  { id: 'lifestyle', label: 'Lifestyle' },
  { id: 'beauty', label: 'Beauté et mode' },
  { id: 'food', label: 'Cuisine' },
  { id: 'fitness', label: 'Sport et fitness' },
  { id: 'education', label: 'Éducation' },
  { id: 'tech', label: 'Tech et digital' },
  { id: 'storytelling', label: 'Storytelling' },
  { id: 'humor', label: 'Humour' },
  { id: 'relations', label: 'Relations et couple' },
  { id: 'personal_dev', label: 'Développement personnel' },
  { id: 'faith', label: 'Foi et spiritualité' },
]);

export const PLATFORMS = Object.freeze([
  { id: 'tiktok', label: 'TikTok', description: 'Vidéos courtes, rythmées, face caméra.' },
  { id: 'facebook', label: 'Facebook', description: 'Posts texte qui font réagir en commentaires.' },
  { id: 'both', label: 'Les deux', description: 'Un mix des deux formats.' },
]);

export const TONES = Object.freeze([
  'Motivationnel',
  'Éducatif',
  'Storytelling',
  'Drôle',
  'Controversé',
  'Provocateur',
  'Professionnel',
]);

export const DURATIONS = Object.freeze(['30 sec', '60 sec', '90 sec']);

/** @param {string} id */
export function nicheLabel(id) {
  return NICHES.find((n) => n.id === id)?.label ?? id;
}

/** @param {string} id */
export function platformLabel(id) {
  return PLATFORMS.find((p) => p.id === id)?.label ?? id;
}
