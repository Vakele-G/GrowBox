import type { Ingredient, Product, ProductIngredient } from "./types";

export interface UnitCostBreakdown {
  ingredientId: string;
  name: string;
  qtyPerUnit: number;
  unit: string;
  costCents: number;
}

export interface CostingResult {
  unitCostCents: number;
  batchCostCents: number;
  profitPerUnitCents: number;
  grossMarginPct: number;
  markupPct: number;
  breakdown: UnitCostBreakdown[];
}

export function ingredientCostPerUnit(
  ingredient: Ingredient,
  qtyPerUnit: number,
): number {
  if (ingredient.packSize <= 0) return 0;
  return (ingredient.packPriceCents / ingredient.packSize) * qtyPerUnit;
}

export function calculateCosting(
  product: Product,
  ingredients: Ingredient[],
  links: ProductIngredient[],
): CostingResult {
  const productLinks = links.filter((link) => link.productId === product.id);
  const breakdown: UnitCostBreakdown[] = [];
  let rawUnitCost = 0;

  for (const link of productLinks) {
    const ingredient = ingredients.find((item) => item.id === link.ingredientId);
    if (!ingredient) continue;
    const cost = ingredientCostPerUnit(ingredient, link.qtyPerUnit);
    rawUnitCost += cost;
    breakdown.push({
      ingredientId: ingredient.id,
      name: ingredient.name,
      qtyPerUnit: link.qtyPerUnit,
      unit: ingredient.packUnit,
      costCents: Math.round(cost),
    });
  }

  const unitCostCents = Math.round(rawUnitCost);
  const price = product.sellingPriceCents;
  const profitPerUnitCents = price - unitCostCents;
  const grossMarginPct = price > 0 ? (profitPerUnitCents / price) * 100 : 0;
  const markupPct = unitCostCents > 0 ? (profitPerUnitCents / unitCostCents) * 100 : 0;

  return {
    unitCostCents,
    batchCostCents: Math.round(rawUnitCost * product.batchYield),
    profitPerUnitCents,
    grossMarginPct,
    markupPct,
    breakdown,
  };
}

export function suggestedPriceCents(
  unitCostCents: number,
  targetMarginPct = 60,
): number {
  const margin = Math.min(Math.max(targetMarginPct, 1), 95) / 100;
  const raw = unitCostCents / (1 - margin);
  return friendlyPriceCents(raw);
}

export function friendlyPriceCents(rawCents: number): number {
  const safe = Math.max(rawCents, 0);
  const step = safe < 1000 ? 50 : 100;
  return Math.ceil(safe / step) * step;
}

export function breakEvenUnitsPerDay(
  fixedDailyCostCents: number,
  priceCents: number,
  unitCostCents: number,
): number | null {
  const contribution = priceCents - unitCostCents;
  if (contribution <= 0) return null;
  return Math.ceil(fixedDailyCostCents / contribution);
}

export function dailyProfitCents(
  unitsSold: number,
  priceCents: number,
  unitCostCents: number,
  fixedDailyCostCents = 0,
): number {
  return unitsSold * (priceCents - unitCostCents) - fixedDailyCostCents;
}

export function paybackDays(
  costCents: number,
  extraDailyProfitCents: number,
): number | null {
  if (extraDailyProfitCents <= 0) return null;
  return Math.ceil(costCents / extraDailyProfitCents);
}

export function affordability(
  equipmentCostCents: number,
  currentDailyProfitCents: number,
  targetDailyProfitWithEquipmentCents: number,
  availableCashCents: number,
) {
  const extraDailyProfitCents =
    targetDailyProfitWithEquipmentCents - currentDailyProfitCents;
  const payback = paybackDays(equipmentCostCents, extraDailyProfitCents);
  return {
    equipmentCostCents,
    extraDailyProfitCents,
    paybackDays: payback,
    affordableNow: availableCashCents >= equipmentCostCents,
    shortfallCents: Math.max(0, equipmentCostCents - availableCashCents),
  };
}
