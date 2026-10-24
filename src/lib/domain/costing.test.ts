import { describe, expect, it } from "vitest";
import {
  affordability,
  breakEvenUnitsPerDay,
  calculateCosting,
  dailyProfitCents,
  friendlyPriceCents,
  paybackDays,
  suggestedPriceCents,
} from "./costing";
import { evaluatePracticality } from "./practicality";
import type { Ingredient, Product } from "./types";

describe("costing and unit economics", () => {
  const product: Product = {
    id: "p1",
    businessId: "b1",
    name: "Amagwinya",
    unitLabel: "gwinya",
    sellingPriceCents: 500, // R5.00
    batchYield: 30,
    isActive: true,
  };

  const ingredients: Ingredient[] = [
    {
      id: "i1",
      businessId: "b1",
      name: "Cooking oil",
      packSize: 5,
      packUnit: "L",
      packPriceCents: 26_000, // R260 for 5L = R52/L
      lastPriceChangeAt: null,
    },
    {
      id: "i2",
      businessId: "b1",
      name: "Cake flour",
      packSize: 10,
      packUnit: "kg",
      packPriceCents: 17_500, // R175 for 10kg = R17.50/kg
      lastPriceChangeAt: null,
    },
  ];

  it("computes unit cost and batch cost from pack prices and recipe quantities", () => {
    // 0.08kg flour (R1.40) + 0.012L oil (R0.62) = R2.02 (202 cents)
    const result = calculateCosting(product, ingredients, [
      { productId: "p1", ingredientId: "i1", qtyPerUnit: 0.012 },
      { productId: "p1", ingredientId: "i2", qtyPerUnit: 0.08 },
    ]);

    expect(result.unitCostCents).toBe(202);
    expect(result.batchCostCents).toBe(6072); // 202.4 * 30 = 6072 cents
    expect(result.profitPerUnitCents).toBe(298); // 500 - 202
    expect(result.grossMarginPct).toBeCloseTo(59.6, 1);
    expect(result.breakdown).toHaveLength(2);
  });

  it("rounds suggested prices to friendly market price points", () => {
    expect(friendlyPriceCents(187.3)).toBe(200);
    expect(friendlyPriceCents(450)).toBe(450);
    expect(friendlyPriceCents(1234.7)).toBe(1300);
    expect(suggestedPriceCents(200, 60)).toBe(500);
  });

  it("calculates break-even units per day correctly", () => {
    // Fixed daily costs: R50 (stall fee R350/week = R50/day)
    // Price: R5, Unit cost: R2.02 -> Contribution: R2.98
    // Break-even: 5000 / 298 = 16.78 -> 17 units/day
    const units = breakEvenUnitsPerDay(5_000, 500, 202);
    expect(units).toBe(17);

    // Negative contribution returns null
    expect(breakEvenUnitsPerDay(5_000, 200, 300)).toBeNull();
  });

  it("calculates daily profit given units sold and fixed costs", () => {
    // Sold 60 gwinyas at R5 with R2.02 cost and R50 fixed cost
    // 60 * 2.98 - 50 = 178.8 - 50 = R128.80 (12,880 cents)
    const profit = dailyProfitCents(60, 500, 202, 5_000);
    expect(profit).toBe(12_880);
  });

  it("computes payback period in days for new equipment", () => {
    // Commercial fryer costs R4,500 (450,000 cents). Extra daily profit = R150 (15,000 cents).
    // Payback = 30 days.
    const days = paybackDays(450_000, 15_000);
    expect(days).toBe(30);

    // No extra profit returns null
    expect(paybackDays(450_000, 0)).toBeNull();
  });

  it("evaluates equipment affordability based on cash on hand", () => {
    const affordable = affordability(450_000, 10_000, 25_000, 500_000);
    expect(affordable.affordableNow).toBe(true);
    expect(affordable.shortfallCents).toBe(0);
    expect(affordable.paybackDays).toBe(30);

    const unaffordable = affordability(450_000, 10_000, 25_000, 200_000);
    expect(unaffordable.affordableNow).toBe(false);
    expect(unaffordable.shortfallCents).toBe(250_000);
  });
});

describe("practicality evaluation and launch planning", () => {
  it("determines launch is viable when budget covers needed equipment and ingredients", () => {
    const result = evaluatePracticality({
      budgetCents: 150_000, // R1,500
      equipmentOwned: ["Gas stove", "Pot", "Gas cylinder"],
      equipmentNeeded: [
        { name: "Gas stove", costCents: 65_000 },
        { name: "Pot", costCents: 18_000 },
        { name: "Display table", costCents: 20_000 },
      ],
      ingredientPackCostsCents: 56_000, // R560 for flour, oil, sugar, yeast
      expectedDailyUnits: 50,
      sellingPriceCents: 500,
      unitCostCents: 202,
    });

    // Needed equipment: Display table (R200) + ingredients (R560) = R760. Budget R1500 => viable!
    expect(result.viable).toBe(true);
    expect(result.totalStartupCostCents).toBe(76_000);
    expect(result.surplusCents).toBe(74_000);
    expect(result.launchPlan.length).toBeGreaterThanOrEqual(4);
    expect(result.notes.some((n) => n.includes("covers the initial startup costs"))).toBe(
      true,
    );
  });

  it("flags shortfall when startup costs exceed budget", () => {
    const result = evaluatePracticality({
      budgetCents: 50_000, // R500
      equipmentOwned: [],
      equipmentNeeded: [
        { name: "Gas stove", costCents: 65_000 },
        { name: "Pot", costCents: 18_000 },
      ],
      ingredientPackCostsCents: 40_000,
      expectedDailyUnits: 30,
      sellingPriceCents: 500,
      unitCostCents: 202,
    });

    expect(result.viable).toBe(false);
    expect(result.surplusCents).toBeLessThan(0);
    expect(result.notes.some((n) => n.includes("falls short"))).toBe(true);
  });
});
