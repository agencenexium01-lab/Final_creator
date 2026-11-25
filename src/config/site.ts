// Réglages éditables du site : contact, vidéos de démonstration, informations légales.
// Modifier ici, sans toucher aux pages.

export const SITE = {
  name: 'Creator Booster IA',
  url: 'https://creator-booster.vercel.app',
  publisher: 'NexiumAgency',
  supportEmail: 'agencenexium01@gmail.com',
  /** Numéro WhatsApp avec indicatif, sans le +. */
  whatsapp: '22942348240',
} as const;

/**
 * Vidéos de démonstration. Coller directement le lien de partage :
 * - Google Drive (le fichier doit être partagé « Tous les utilisateurs disposant du lien ») ;
 * - YouTube (vidéo publique ou « non répertoriée ») ;
 * - ou un fichier .mp4 placé dans public/videos/ (ex. '/videos/demo.mp4') : la solution la plus pro,
 *   lecteur 100 % intégré au site, sans logo ni lien vers un autre service.
 * Une valeur vide affiche un emplacement « Démo vidéo bientôt disponible ».
 */
export const DEMO_VIDEOS = {
  hero: 'https://drive.google.com/file/d/1k145PtobmiCMZjWqmYdg5wjQgdagrduK/view?usp=drivesdk',
  calendar: '',
  script: '',
  hooks: '',
  ideas: '',
} as const;

/**
 * Informations légales affichées dans les pages Confidentialité et Conditions.
 * À compléter avant la mise en ligne (obligatoire pour la vente en ligne).
 */
export const LEGAL = {
  companyName: 'NexiumAgency',
  legalForm: 'À compléter (ex. entreprise individuelle, SARL)',
  registration: 'À compléter (numéro RCCM / IFU)',
  address: 'À compléter (adresse du siège)',
  country: 'Bénin',
  dataProtectionAuthority: "Autorité de Protection des Données à caractère Personnel (APDP), Bénin",
  lastUpdated: '25 novembre 2026',
} as const;
