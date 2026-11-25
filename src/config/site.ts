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
 * Vidéos de démonstration (format « embed » : YouTube https://www.youtube-nocookie.com/embed/<id>,
 * ou Google Drive https://drive.google.com/file/d/<id>/preview).
 * Une valeur vide affiche un emplacement réservé « Démo vidéo bientôt disponible ».
 */
export const DEMO_VIDEOS = {
  hero: 'https://drive.google.com/file/d/1lePbr0Ju-_ArgTpUWmHNS-jtHs6wevy2/preview',
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
