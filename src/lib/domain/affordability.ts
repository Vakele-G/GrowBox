export interface EquipmentOption {
  id: string;
  name: string;
  costCents: number;
  extraUnitsPerDay: number;
  productName: string;
  sellingPriceCents: number;
  costPerUnitCents: number;
}

export interface AffordabilityCalculation {
  equipmentName: string;
  costCents: number;
  cashOnHandCents: number;
  isAffordable: boolean;
  shortfallCents: number;
  unitProfitCents: number;
  extraProfitPerDayCents: number;
  paybackDays: number;
  extraUnitsNeededPerDay: number;
}

export const SECOND_FRYER_OPTION: EquipmentOption = {
  id: "equip_commercial_fryer",
  name: "Double-Pan Commercial Gas Fryer (2x 10L)",
  costCents: 450_000, // R4,500
  extraUnitsPerDay: 35, // 35 more amagwinya during peak taxi morning rush
  productName: "Amagwinya",
  sellingPriceCents: 500, // R5.00
  costPerUnitCents: 202, // R2.02 from Stage 1 recipe costing
};

/**
 * Calculates equipment affordability, payback period in trading days,
 * and daily sales required to justify the expansion.
 */
export function calculateEquipmentAffordability(
  equipment: EquipmentOption = SECOND_FRYER_OPTION,
  cashOnHandCents: number,
  targetPaybackDays = 60,
): AffordabilityCalculation {
  const isAffordable = cashOnHandCents >= equipment.costCents;
  const shortfallCents = Math.max(0, equipment.costCents - cashOnHandCents);
  const unitProfitCents = Math.max(0, equipment.sellingPriceCents - equipment.costPerUnitCents);
  const extraProfitPerDayCents = equipment.extraUnitsPerDay * unitProfitCents;

  const paybackDays =
    extraProfitPerDayCents > 0
      ? Math.ceil(equipment.costCents / extraProfitPerDayCents)
      : 999;

  const extraUnitsNeededPerDay =
    unitProfitCents > 0
      ? Math.ceil(equipment.costCents / (targetPaybackDays * unitProfitCents))
      : 0;

  return {
    equipmentName: equipment.name,
    costCents: equipment.costCents,
    cashOnHandCents,
    isAffordable,
    shortfallCents,
    unitProfitCents,
    extraProfitPerDayCents,
    paybackDays,
    extraUnitsNeededPerDay,
  };
}
