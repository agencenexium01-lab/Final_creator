// Ré-export typé de la source unique des prix (src/shared/pricing.js).
export {
  TOOL_COSTS,
  PACKS,
  MONTH_PLAN,
  getPack,
  creditPriceFcfa,
  monthCostFcfa,
  packCoverage,
  formatFcfa,
} from '@/shared/pricing.js';

export type PackId = 'starter' | 'createur' | 'pro';
