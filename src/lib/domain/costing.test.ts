import { describe, expect, it } from "vitest";
import { calculateCosting, friendlyPriceCents, suggestedPriceCents } from "./costing";
import type { Ingredient, Product } from "./types";

describe("costing", () => {
  const product: Product = {
    id: "p1",
    businessId: "b1",
    name: "Amagwinya",
    unitLabel: "gwinya",
    sellingPriceCents: 500,
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
      packPriceCents: 26_000,
      lastPriceChangeAt: null,
    },
    {
      id: "i2",
      businessId: "b1",
      name: "Cake flour",
      packSize: 10,
      packUnit: "kg",
      packPriceCents: 17_500,
      lastPriceChangeAt: null,
    },
  ];

  it("computes unit cost from pack prices and quantities", () => {
    const result = calculateCosting(product, ingredients, [
      { productId: "p1", ingredientId: "i1", qtyPerUnit: 0.012 },
      { productId: "p1", ingredientId: "i2", qtyPerUnit: 0.08 },
    ]);

    expect(result.unitCostCents).toBeGreaterThan(0);
    expect(result.unitCostCents).toBeLessThan(product.sellingPriceCents);
  });

  it("rounds suggested prices to friendly price points", () => {
    expect(friendlyPriceCents(187.3)).toBe(200);
    expect(friendlyPriceCents(1234.7)).toBe(1300);
    expect(suggestedPriceCents(234)).toBe(600);
  });
});
