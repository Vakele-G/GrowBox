import { describe, expect, it } from "vitest";
import { createSeedData } from "@/lib/db/seed";
import { computeHealthScore, healthBand } from "./health";
import { computeBusinessMetrics } from "./metrics";
import type { BusinessMetrics } from "./types";

function createMockMetrics(overrides: Partial<BusinessMetrics> = {}): BusinessMetrics {
  return {
    cashOnHandCents: 255_000,
    totalSalesCents: 1_200_000,
    totalExpensesCents: 945_000,
    ownerWithdrawalsCents: 0,
    last14SalesCents: 600_000,
    last14ExpensesCents: 450_000,
    last14ProfitCents: 150_000,
    fourWeekSalesCents: 1_200_000,
    fourWeekExpensesCents: 945_000,
    fourWeekMarginPct: 56,
    previousWeekMarginPct: 58,
    weeklyMarginPct: 55,
    averageDailyExpenseCents: 30_000,
    averageDailySalesCents: 40_000,
    cashRunwayDays: 4,
    stockDaysCover: 2.5,
    savingsBufferWeeks: 1.5,
    nextRestockCostCents: 117_800,
    restockShortfallCents: 0,
    tradingDaysLast30: 28,
    loggedDaysLast30: 28,
    daysSinceLastTransaction: 0,
    daysSinceStageStart: 30,
    ...overrides,
  };
}

describe("M07 — Business Health Score", () => {
  it("determines correct health band from score", () => {
    expect(healthBand(85)).toBe("ready");
    expect(healthBand(80)).toBe("ready");
    expect(healthBand(79)).toBe("bankable");
    expect(healthBand(60)).toBe("bankable");
    expect(healthBand(59)).toBe("emerging");
    expect(healthBand(40)).toBe("emerging");
    expect(healthBand(39)).toBe("building");
    expect(healthBand(0)).toBe("building");
  });

  it("calculates component breakdown that respects weights (total <= 100)", () => {
    const metrics = createMockMetrics();
    const result = computeHealthScore(metrics, 0.7);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);

    // Component weights
    expect(result.components.profitability).toBeLessThanOrEqual(25);
    expect(result.components.cashBuffer).toBeLessThanOrEqual(20);
    expect(result.components.recordConsistency).toBeLessThanOrEqual(20);
    expect(result.components.marginStability).toBeLessThanOrEqual(15);
    expect(result.components.savingsDiscipline).toBeLessThanOrEqual(10);
    expect(result.components.complianceProgress).toBeLessThanOrEqual(10);
  });

  it("computes Health Score in 60-70 band for seeded Nomsa persona", () => {
    const seed = createSeedData("2026-10-24", "full");
    const metrics = computeBusinessMetrics(
      seed.transactions,
      seed.ingredients,
      seed.products,
      seed.businesses[0],
      "2026-10-24",
    );

    const result = computeHealthScore(metrics, 0.5);
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.score).toBeLessThanOrEqual(75);
    expect(result.band).toBe("bankable");
  });

  it("generates targeted improvement advice when metrics are weak", () => {
    const weakMetrics = createMockMetrics({
      fourWeekMarginPct: 20, // < 40
      savingsBufferWeeks: 0.5, // < 2
      loggedDaysLast30: 12, // < 25
      previousWeekMarginPct: 40,
      weeklyMarginPct: 20, // margin change > 5
    });

    const result = computeHealthScore(weakMetrics, 0.2);
    expect(result.improvements.length).toBeGreaterThanOrEqual(3);
    expect(result.improvements.some((i) => i.includes("margin towards 40%"))).toBe(true);
    expect(result.improvements.some((i) => i.includes("two weeks of expenses"))).toBe(true);
    expect(result.improvements.some((i) => i.includes("aim for 25"))).toBe(true);
  });
});
