// Comment proposer « Ajouter à l'écran d'accueil » selon le téléphone et le navigateur.

/**
 * @param {{ ua: string, standalone: boolean, canPrompt: boolean }} env
 * @returns {'installed' | 'prompt' | 'ios' | 'inapp' | 'menu'}
 *  installed : déjà ouverte comme application
 *  prompt    : le navigateur sait installer en un clic (Chrome, Edge, Samsung Internet)
 *  ios       : iPhone / iPad, via Partager puis « Sur l'écran d'accueil »
 *  inapp     : navigateur intégré de TikTok, Facebook, Instagram : ouvrir d'abord dans le vrai navigateur
 *  menu      : passer par le menu du navigateur
 */
export function installMethod({ ua, standalone, canPrompt }) {
  if (standalone) return 'installed';
  if (/FBAN|FBAV|FB_IAB|Instagram|musical_ly|Bytedance|TikTok/i.test(ua)) return 'inapp';
  if (canPrompt) return 'prompt';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  return 'menu';
}
