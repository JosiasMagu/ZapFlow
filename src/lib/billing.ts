// src/lib/billing.ts
// Helper para montar UI de planos e calcular preços com descontos.

import { PLAN_PRICING, computeMonthlyPrice, computeNumberAddonsCost, computeAICost } from './plans';
import type { PlanTier, PurchasedAddons } from './plans';

export function formatMT(n: number): string {
  return `${n.toLocaleString('pt-MZ')} MT`;
}

export function priceBreakdown(tier: PlanTier, addons: PurchasedAddons) {
  const base = PLAN_PRICING[tier].monthly;
  const nCost = computeNumberAddonsCost(tier, addons.extraNumbers || 0);
  const aiCost = computeAICost(tier, addons);

  return {
    base,
    numbers: nCost,
    ai: aiCost,
    total: base + nCost + aiCost,
    label: {
      base: `Plano ${tier === 'basic' ? 'Básico' : tier === 'intermediate' ? 'Intermediário' : 'Avançado'}`,
      numbers: addons.extraNumbers ? `+${addons.extraNumbers} número(s) (descontos aplicados)` : '',
      ai: (addons.extraAIBots || addons.aiInteractionPacks) ? `Add-ons de IA` : '',
    }
  };
}

export function monthlyPriceLabel(tier: PlanTier, addons: PurchasedAddons) {
  return formatMT(computeMonthlyPrice(tier, addons));
}
