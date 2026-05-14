import { ToolType } from '../types';

// Coût en crédits par type d'outil
const CREDIT_COSTS: Record<ToolType, number> = {
  hooks: 10,
  script: 15,
  ideas: 5,
  calendar: 20,
};

export const creditService = {
  // Obtenir le coût en crédits pour un outil
  getCost: (tool: ToolType): number => {
    return CREDIT_COSTS[tool] || 0;
  },

  // Vérifier si l'utilisateur a assez de crédits
  hasEnoughCredits: (currentCredits: number, tool: ToolType): boolean => {
    const cost = CREDIT_COSTS[tool];
    return currentCredits >= cost;
  },

  // Formater le coût pour l'affichage
  formatCost: (tool: ToolType): string => {
    const cost = CREDIT_COSTS[tool];
    return `${cost} crédit${cost > 1 ? 's' : ''}`;
  },

  // Obtenir tous les coûts
  getAllCosts: (): Record<ToolType, number> => {
    return CREDIT_COSTS;
  },
};
