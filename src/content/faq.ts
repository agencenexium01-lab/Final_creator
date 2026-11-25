import { MONTH_PLAN, PACKS, TOOL_COSTS, formatFcfa, monthCostFcfa } from '@/config/pricing';

const cheapest = Math.min(...PACKS.map(monthCostFcfa));
const dearest = Math.max(...PACKS.map(monthCostFcfa));

export const FAQ: { q: string; a: string }[] = [
  {
    q: 'Combien de crédits consomme chaque outil ?',
    a: `Calendrier de 30 jours : ${TOOL_COSTS.calendar} crédits. Script TikTok ou post Facebook : ${TOOL_COSTS.script} crédits. 20 idées : ${TOOL_COSTS.ideas} crédits. 10 hooks : ${TOOL_COSTS.hooks} crédits. Un mois complet (1 calendrier + ${MONTH_PLAN.scripts} scripts) demande ${MONTH_PLAN.credits} crédits, soit entre ${formatFcfa(cheapest)} et ${formatFcfa(dearest)} selon le pack.`,
  },
  {
    q: 'Mes crédits expirent-ils ?',
    a: "Non. Il n'y a pas d'abonnement et les crédits restent sur ton compte tant que tu ne les utilises pas.",
  },
  {
    q: 'Comment je paie ?',
    a: 'Par Mobile Money ou carte bancaire, sur la page sécurisée de notre prestataire Chariow. Tes crédits sont ajoutés automatiquement dès que le paiement est confirmé, en général en moins d’une minute.',
  },
  {
    q: 'Et si une génération échoue ?',
    a: "Si l'IA ne renvoie pas un résultat exploitable, les crédits sont remboursés automatiquement sur ton solde. Tu peux relancer tout de suite.",
  },
  {
    q: 'Mes crédits n’apparaissent pas après mon paiement, que faire ?',
    a: 'Patiente deux minutes : la confirmation de certains opérateurs Mobile Money prend un peu de temps. Si le solde n’a pas bougé, écris-nous sur WhatsApp avec l’adresse e-mail de ton compte et la référence du paiement.',
  },
  {
    q: 'Puis-je changer ma niche ou ma plateforme ?',
    a: 'Oui, à tout moment dans Paramètres. Tu peux aussi écrire une niche libre directement dans chaque outil.',
  },
];
