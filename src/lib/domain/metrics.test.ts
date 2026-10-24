import { describe, expect, it } from "vitest";
import { createSeedData } from "@/lib/db/seed";
import { computeBusinessMetrics, evaluateWarnings } from "./metrics";

describe("M05 — Business Metrics & Financial Forecasting", () => {
  const seed = createSeedData("2026-10-24", "full");
  const business = seed.businesses[0]!;
  const transactions = seed.transactions;
  const ingredients = seed.ingredients;
  const products = seed.products;

  it("computes accurate cash on hand and profitability metrics from transactions", () => {
    const metrics = computeBusinessMetrics(
      transactions,
      ingredients,
      products,
      business,
      "2026-10-24",
    );

    expect(metrics.totalSalesCents).toBeGreaterThan(0);
    expect(metrics.totalExpensesCents).toBeGreaterThan(0);
    expect(metrics.cashOnHandCents).toBe(metrics.totalSalesCents - metrics.totalExpensesCents);
    expect(metrics.tradingDaysLast30).toBeGreaterThanOrEqual(20);
    expect(metrics.fourWeekMarginPct).toBeGreaterThan(40);
  });

  it("calculates cash runway, stock days of cover, and savings buffer", () => {
    const metrics = computeBusinessMetrics(
      transactions,
      ingredients,
      products,
      business,
      "2026-10-24",
    );

    expect(metrics.cashRunwayDays).toBeDefined();
    expect(metrics.cashRunwayDays).toBeGreaterThan(0);
    expect(metrics.stockDaysCover).toBeDefined();
    expect(metrics.savingsBufferWeeks).toBeGreaterThan(0);
  });

  it("seeded persona triggers the margin drop warning from recent oil price hike", () => {
    const metrics = computeBusinessMetrics(
      transactions,
      ingredients,
      products,
      business,
      "2026-10-24",
    );

    const warnings = evaluateWarnings(metrics, "2026-10-24");
    const marginWarning = warnings.find((w) => w.key === "margin_drop");

    expect(marginWarning).toBeDefined();
    expect(marginWarning?.severity).toBe("warning");
    expect(marginWarning?.messageEn).toContain("gross margin dropped");
  });

  it("seeded persona produces the expected Thursday cash runway warning", () => {
    // Sunday 2026-10-25 or Saturday 2026-10-24 with target cash ~R2,550
    // At ~R700 daily expense, runway is ~3-4 days (landing on Thursday!)
    const metrics = computeBusinessMetrics(
      transactions,
      ingredients,
      products,
      business,
      "2026-10-25",
    );

    const warnings = evaluateWarnings(metrics, "2026-10-25");
    const cashWarning = warnings.find((w) => w.key === "cash_runway");

    expect(cashWarning).toBeDefined();
    // Expect the message to name Thursday or contain the exact date calculation
    expect(cashWarning?.messageEn).toMatch(/Thursday|run out of cash/i);
    expect(cashWarning?.calculationExplanation).toContain("days of runway");
  });

  it("detects inactivity when transactions are missing for 2 or more days", () => {
    // Querying with 'now' 3 days after latest transaction
    const metrics = computeBusinessMetrics(
      transactions,
      ingredients,
      products,
      business,
      "2026-10-28",
    );

    const warnings = evaluateWarnings(metrics, "2026-10-28");
    const inactivity = warnings.find((w) => w.key === "inactivity");
    expect(inactivity).toBeDefined();
    expect(inactivity?.title).toBe("Keep Records Fresh");
  });
});
