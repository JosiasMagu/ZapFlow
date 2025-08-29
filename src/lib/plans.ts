// src/lib/plans.ts
// Tabela de planos + limites efetivos (considerando add-ons) + precificação dos add-ons.

export type PlanTier = 'basic' | 'intermediate' | 'advanced';

export type PlanLimits = {
  tier: PlanTier;

  // Limites core
  maxFlows: number;
  maxMessageNodesPerFlow: number;
  maxCampaignsPerMonth: number;
  maxCampaignSendsPerMonth?: number;
  maxContacts: number;
  baseConnections: number;
  maxConnectionsCap?: number;

  // Recursos
  mediaEnabled: boolean;
  webhookEnabled: boolean;
  typingIndicatorAllowed: boolean; // “digitando/gravando”

  // IA
  ai: {
    botsAllowed: number;                         // base do plano
    monthlyInteractionLimitPerAccount?: number;  // base do plano
  };

  // Opcional (mantido p/ compat com telas que checam rodapé de trial)
  trialFooterRequired?: boolean; // default: false nos planos pagos
};

// Add-ons adquiridos pelo cliente (backend retorna estes dados)
export type PurchasedAddons = {
  extraNumbers: number;          // +N conexões (números)
  extraAIBots?: number;          // +N bots de IA extras (pago à parte)
  aiInteractionPacks?: number;   // +N pacotes de interações de IA (cada pack soma X)
};

// Precificação (exibição e cálculo no front; backend é a fonte da verdade)
export type PlanPricing = {
  monthly: number;            // preço do plano
  addonNumberPrice: number;   // preço base por número extra (antes de descontos)
  discounts: {
    twoNumbersPct: number;    // 0.15 -> 15%
    threeNumbersPct: number;  // 0.20 -> 20%
  };
  ai: {
    extraBotPrice?: number;       // preço por bot IA extra (opcional)
    interactionPackPrice?: number;// preço por pack de interações (opcional)
    interactionPackUnits?: number;// tamanho do pack (quantidade de interações)
  };
};

export const PLAN_PRICING: Record<PlanTier, PlanPricing> = {
  basic: {
    monthly: 450,
    addonNumberPrice: 300,
    discounts: { twoNumbersPct: 0.15, threeNumbersPct: 0.20 },
    ai: { /* IA não disponível no base; extras opcionais via backend */ },
  },
  intermediate: {
    monthly: 850,
    addonNumberPrice: 300,
    discounts: { twoNumbersPct: 0.15, threeNumbersPct: 0.20 },
    ai: { extraBotPrice: 250, interactionPackPrice: 150, interactionPackUnits: 500 },
  },
  advanced: {
    monthly: 1500,
    addonNumberPrice: 300,
    discounts: { twoNumbersPct: 0.15, threeNumbersPct: 0.20 },
    ai: { extraBotPrice: 200, interactionPackPrice: 120, interactionPackUnits: 1000 },
  },
};

export const BASE_PLANS: Record<PlanTier, PlanLimits> = {
  basic: {
    tier: 'basic',
    maxFlows: 3,
    maxMessageNodesPerFlow: 12,
    maxCampaignsPerMonth: 3,
    maxContacts: 500,
    baseConnections: 1,
    maxConnectionsCap: 3,            // suporta até 3 números no Basic
    mediaEnabled: false,             // sem mídia
    webhookEnabled: false,
    typingIndicatorAllowed: true,    // “digitando” permitido
    ai: { botsAllowed: 0 },
    trialFooterRequired: false,
  },
  intermediate: {
    tier: 'intermediate',
    maxFlows: 15,
    maxMessageNodesPerFlow: 30,
    maxCampaignsPerMonth: 10,
    maxContacts: 5000,
    baseConnections: 1,
    mediaEnabled: true,
    webhookEnabled: true,
    typingIndicatorAllowed: true,
    ai: { botsAllowed: 1, monthlyInteractionLimitPerAccount: 1000 },
    trialFooterRequired: false,
  },
  advanced: {
    tier: 'advanced',
    maxFlows: 30,
    maxMessageNodesPerFlow: 60,
    maxCampaignsPerMonth: 25,
    maxContacts: 20000,
    baseConnections: 2,
    mediaEnabled: true,
    webhookEnabled: true,
    typingIndicatorAllowed: true,
    ai: { botsAllowed: 2, monthlyInteractionLimitPerAccount: 5000 },
    trialFooterRequired: false,
  },
};

// ===== Helpers de preços dos add-ons =====
export function computeNumberAddonsCost(tier: PlanTier, extraNumbers: number): number {
  if (!extraNumbers || extraNumbers <= 0) return 0;
  const p = PLAN_PRICING[tier];
  const base = p.addonNumberPrice;

  // +1 = preço cheio
  // +2 = (base*2) com 15% de desconto
  // +3 ou mais = (base*N) com 20% de desconto
  if (extraNumbers === 1) return base;
  if (extraNumbers === 2) return Math.round((base * 2) * (1 - p.discounts.twoNumbersPct));
  return Math.round((base * extraNumbers) * (1 - p.discounts.threeNumbersPct));
}

export function computeAICost(tier: PlanTier, addons: PurchasedAddons): number {
  const cfg = PLAN_PRICING[tier].ai;
  if (!cfg) return 0;
  let total = 0;
  if (addons.extraAIBots && cfg.extraBotPrice) {
    total += addons.extraAIBots * cfg.extraBotPrice;
  }
  if (addons.aiInteractionPacks && cfg.interactionPackPrice) {
    total += addons.aiInteractionPacks * cfg.interactionPackPrice;
  }
  return total;
}

export function computeMonthlyPrice(tier: PlanTier, addons: PurchasedAddons): number {
  const plan = PLAN_PRICING[tier];
  return plan.monthly + computeNumberAddonsCost(tier, addons.extraNumbers || 0) + computeAICost(tier, addons);
}

// ===== Limites efetivos (aplicando add-ons) =====
export function effectiveLimits(plan: PlanTier, purchased: PurchasedAddons): PlanLimits {
  const base = { ...BASE_PLANS[plan] };

  // Conexões extras (respeitando cap no Basic)
  if (typeof purchased?.extraNumbers === 'number' && purchased.extraNumbers > 0) {
    const cap = base.maxConnectionsCap ?? Number.POSITIVE_INFINITY;
    base.baseConnections = Math.min(base.baseConnections + purchased.extraNumbers, cap);
  }

  // Bots de IA extras
  if (purchased?.extraAIBots && purchased.extraAIBots > 0) {
    base.ai = { ...base.ai, botsAllowed: (base.ai.botsAllowed ?? 0) + purchased.extraAIBots };
  }

  // Pacotes extras de interações de IA
  if (purchased?.aiInteractionPacks && purchased.aiInteractionPacks > 0) {
    const cfg = PLAN_PRICING[plan].ai;
    if (cfg?.interactionPackUnits && base.ai.monthlyInteractionLimitPerAccount != null) {
      base.ai = {
        ...base.ai,
        monthlyInteractionLimitPerAccount:
          (base.ai.monthlyInteractionLimitPerAccount ?? 0) +
          purchased.aiInteractionPacks * cfg.interactionPackUnits,
      };
    }
  }

  return base;
}
