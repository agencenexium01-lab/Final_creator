// Source unique des prix et des coûts en crédits.
// Importé par le front (Vite) ET par les fonctions serveur (Vercel) : ne rien y mettre
// qui dépende du navigateur ou de Node.

/** @typedef {'hooks' | 'ideas' | 'script' | 'calendar'} ToolId */
/** @typedef {'starter' | 'createur' | 'pro'} PackId */

/**
 * @typedef {Object} Pack
 * @property {PackId} id
 * @property {string} name
 * @property {number} priceFcfa
 * @property {number} credits
 * @property {string} productEnvKey  Variable d'environnement qui contient l'id produit Chariow
 * @property {boolean} [recommended]
 */

/** Coût en crédits de chaque outil. */
export const TOOL_COSTS = Object.freeze({
  hooks: 2,
  ideas: 3,
  script: 3,
  calendar: 10,
});

/** @type {ReadonlyArray<ToolId>} */
export const TOOL_IDS = Object.freeze(/** @type {ToolId[]} */ (['calendar', 'script', 'hooks', 'ideas']));

/** Un mois de contenu = 1 calendrier + 30 scripts (une vidéo par jour). */
export const MONTH_PLAN = Object.freeze({
  scripts: 30,
  credits: TOOL_COSTS.calendar + 30 * TOOL_COSTS.script,
});

/** @type {ReadonlyArray<Pack>} */
export const PACKS = Object.freeze([
  { id: 'starter', name: 'Pack Starter', priceFcfa: 3000, credits: 50, productEnvKey: 'CHARIOW_PRODUCT_STARTER' },
  { id: 'createur', name: 'Pack Créateur', priceFcfa: 7000, credits: 150, productEnvKey: 'CHARIOW_PRODUCT_CREATEUR', recommended: true },
  { id: 'pro', name: 'Pack Pro', priceFcfa: 14000, credits: 350, productEnvKey: 'CHARIOW_PRODUCT_PRO' },
]);

/**
 * @param {string} tool
 * @returns {number | null}
 */
export function getToolCost(tool) {
  return Object.prototype.hasOwnProperty.call(TOOL_COSTS, tool) ? TOOL_COSTS[/** @type {ToolId} */ (tool)] : null;
}

/**
 * @param {string} id
 * @returns {Pack | null}
 */
export function getPack(id) {
  return PACKS.find((p) => p.id === id) ?? null;
}

/**
 * Retrouve le pack correspondant à un id produit Chariow, à partir des variables d'environnement.
 * @param {string | undefined | null} productId
 * @param {Record<string, string | undefined>} env
 * @returns {Pack | null}
 */
export function getPackByProductEnvKey(productId, env) {
  if (!productId) return null;
  return PACKS.find((p) => env[p.productEnvKey] && env[p.productEnvKey] === productId) ?? null;
}

/** @param {Pack} pack */
export function creditPriceFcfa(pack) {
  return Math.round((pack.priceFcfa / pack.credits) * 100) / 100;
}

/** Prix d'un mois complet (100 crédits) avec ce pack, arrondi au franc. @param {Pack} pack */
export function monthCostFcfa(pack) {
  return Math.round((pack.priceFcfa * MONTH_PLAN.credits) / pack.credits);
}

/**
 * Ce que couvre un pack : mois complets, puis un calendrier de plus si possible, puis des scripts.
 * @param {Pack} pack
 */
export function packCoverage(pack) {
  const months = Math.floor(pack.credits / MONTH_PLAN.credits);
  let rest = pack.credits - months * MONTH_PLAN.credits;
  let calendars = months;
  if (rest >= TOOL_COSTS.calendar) {
    calendars += 1;
    rest -= TOOL_COSTS.calendar;
  }
  const scripts = months * MONTH_PLAN.scripts + Math.floor(rest / TOOL_COSTS.script);
  const leftover = rest % TOOL_COSTS.script;
  return { months, calendars, scripts, leftover };
}

/** @param {number} amount */
export function formatFcfa(amount) {
  const rounded = Math.round(amount);
  return `${String(rounded).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')}\u00a0FCFA`;
}
