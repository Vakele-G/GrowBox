export interface PracticalityInput {
  budgetCents: number;
  equipmentOwned: string[];
  equipmentNeeded: { name: string; costCents: number }[];
  ingredientPackCostsCents: number;
  expectedDailyUnits: number;
  sellingPriceCents: number;
  unitCostCents: number;
  fixedDailyCostCents?: number;
}

export interface PracticalityResult {
  viable: boolean;
  totalStartupCostCents: number;
  equipmentCostCents: number;
  initialStockCostCents: number;
  surplusCents: number;
  notes: string[];
  launchPlan: string[];
}

export function evaluatePracticality(input: PracticalityInput): PracticalityResult {
  const neededEquipmentCost = input.equipmentNeeded
    .filter(
      (item) =>
        !input.equipmentOwned.some((owned) =>
          owned.toLowerCase().includes(item.name.toLowerCase()),
        ),
    )
    .reduce((sum, item) => sum + item.costCents, 0);

  const initialStockCostCents = input.ingredientPackCostsCents;
  const totalStartupCostCents = neededEquipmentCost + initialStockCostCents;
  const surplusCents = input.budgetCents - totalStartupCostCents;
  const viable = surplusCents >= 0;

  const notes: string[] = [];
  if (viable) {
    notes.push(
      `Your budget of R${(input.budgetCents / 100).toFixed(0)} covers the initial startup costs (R${(totalStartupCostCents / 100).toFixed(0)}), leaving a buffer of R${(surplusCents / 100).toFixed(0)}.`,
    );
  } else {
    notes.push(
      `Your startup budget falls short by R${Math.abs(surplusCents / 100).toFixed(0)}. Consider starting with existing equipment or buying secondhand.`,
    );
  }

  const marginPct =
    input.sellingPriceCents > 0
      ? ((input.sellingPriceCents - input.unitCostCents) / input.sellingPriceCents) * 100
      : 0;

  if (marginPct >= 50) {
    notes.push(
      `Healthy gross margin of ${marginPct.toFixed(1)}% allows room for unexpected price fluctuations.`,
    );
  } else {
    notes.push(
      `Gross margin of ${marginPct.toFixed(1)}% is slim. Monitor input prices closely or test a higher selling price point.`,
    );
  }

  const launchPlan: string[] = [
    "Buy the first flour, oil and ingredient pack from your nearest wholesaler to secure bulk pricing.",
    "Confirm your trading spot with the stall owner or local municipality customer service centre.",
    "Complete a basic food-handling certificate and keep the certificate available for health inspectors.",
    "Keep a daily cash book or log every sale and expense in GrowBox from day one.",
  ];

  return {
    viable,
    totalStartupCostCents,
    equipmentCostCents: neededEquipmentCost,
    initialStockCostCents,
    surplusCents,
    notes,
    launchPlan,
  };
}
