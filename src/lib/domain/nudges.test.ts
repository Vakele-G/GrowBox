import { describe, expect, it } from "vitest";
import { phraseNudgeFallback } from "../ai/phrasing";
import { determineNextBestStep, generateNudges } from "./nudges";
import { detectStage } from "./stage";
import type { Business, BusinessMetrics } from "./types";

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
    previousWeekMarginPct: 62, // 8% drop week-on-week
    weeklyMarginPct: 54,
    averageDailyExpenseCents: 30_000,
    averageDailySalesCents: 40_000,
    cashRunwayDays: 4, // Thursday runway warning
    stockDaysCover: 0.8, // Stock cover < 1 day
    savingsBufferWeeks: 0.9, // Buffer < 1 week
    nextRestockCostCents: 117_800,
    restockShortfallCents: 0,
    tradingDaysLast30: 30,
    loggedDaysLast30: 30,
    daysSinceLastTransaction: 2, // 2 days inactive
    daysSinceStageStart: 30,
    ...overrides,
  };
}

function createMockBusiness(overrides: Partial<Business> = {}): Business {
  return {
    id: "biz_test",
    ownerId: "owner_test",
    name: "Nomsa's Kitchen",
    stage: "stable",
    municipality: "City of Johannesburg",
    language: "en",
    monthlyBudgetCents: 150_000,
    onboarding: null,
    createdAt: "2026-09-01T00:00:00+02:00",
    ...overrides,
  };
}

describe("generateNudges", () => {
  it("generates margin drop nudge when drop >= 5%", () => {
    const biz = createMockBusiness();
    const metrics = createMockMetrics({
      weeklyMarginPct: 52,
      previousWeekMarginPct: 60,
    });
    const stageInfo = detectStage(biz, metrics, null);

    const nudges = generateNudges(biz, metrics, stageInfo, "2026-10-25");
    const marginNudge = nudges.find((n) => n.ruleKey === "margin_drop");

    expect(marginNudge).toBeDefined();
    expect(marginNudge?.severity).toBe("warning");
    expect(marginNudge?.messageEn).toContain("reducing your margin by 8%");
    expect(marginNudge?.messageZu).toContain("ngo-8%");
  });

  it("generates cash runway nudge when runway <= 4 days", () => {
    const biz = createMockBusiness();
    const metrics = createMockMetrics({
      cashRunwayDays: 4,
      cashOnHandCents: 255_000,
      nextRestockCostCents: 117_800,
    });
    const stageInfo = detectStage(biz, metrics, null);

    const nudges = generateNudges(biz, metrics, stageInfo, "2026-10-25");
    const cashNudge = nudges.find((n) => n.ruleKey === "cash_runway");

    expect(cashNudge).toBeDefined();
    expect(cashNudge?.messageEn).toContain("Thursday");
    expect(cashNudge?.messageZu).toContain("ngoLwesine");
  });

  it("generates critical stock cover nudge when stock days < 1", () => {
    const biz = createMockBusiness();
    const metrics = createMockMetrics({ stockDaysCover: 0.5 });
    const stageInfo = detectStage(biz, metrics, null);

    const nudges = generateNudges(biz, metrics, stageInfo, "2026-10-25");
    const stockNudge = nudges.find((n) => n.ruleKey === "stock_cover");

    expect(stockNudge).toBeDefined();
    expect(stockNudge?.severity).toBe("critical");
  });

  it("generates stage transition nudge when Stage 3 criteria are satisfied", () => {
    const biz = createMockBusiness({ stage: "stable" });
    const metrics = createMockMetrics({
      loggedDaysLast30: 25,
      fourWeekMarginPct: 55,
      savingsBufferWeeks: 1.2,
    });
    const stageInfo = detectStage(biz, metrics, null);

    const nudges = generateNudges(biz, metrics, stageInfo, "2026-10-25");
    const stageNudge = nudges.find((n) => n.ruleKey === "stage_transition");

    expect(stageNudge).toBeDefined();
    expect(stageNudge?.severity).toBe("info");
    expect(stageNudge?.messageEn).toContain("You're ready to grow!");
  });
});

describe("determineNextBestStep", () => {
  it("prioritizes stage transition when ready to advance to grow", () => {
    const biz = createMockBusiness({ stage: "stable" });
    const metrics = createMockMetrics({
      loggedDaysLast30: 25,
      fourWeekMarginPct: 55,
      savingsBufferWeeks: 1.2,
    });
    const stageInfo = detectStage(biz, metrics, null);
    const nudges = generateNudges(biz, metrics, stageInfo, "2026-10-25");

    const step = determineNextBestStep(stageInfo, nudges, metrics);
    expect(step.badge).toBe("Stage Up");
    expect(step.title).toContain("ready to grow");
    expect(step.actionLabel).toContain("Second Fryer");
  });

  it("prioritizes cash runway warning when not advancing", () => {
    const biz = createMockBusiness({ stage: "stable" });
    const metrics = createMockMetrics({
      loggedDaysLast30: 10, // not ready to advance
      cashRunwayDays: 3,
    });
    const stageInfo = detectStage(biz, metrics, null);
    const nudges = generateNudges(biz, metrics, stageInfo, "2026-10-25");

    const step = determineNextBestStep(stageInfo, nudges, metrics);
    expect(step.badge).toBe("Action Required");
    expect(step.title).toContain("Thursday Stock Cash");
  });
});

describe("phraseNudgeFallback", () => {
  it("renders deterministic English and isiZulu phrasing for margin drop", () => {
    const payload = { dropPct: 7, prevMargin: 61, currentMargin: 54 };
    const en = phraseNudgeFallback("margin_drop", payload, "en");
    const zu = phraseNudgeFallback("margin_drop", payload, "zu");

    expect(en).toContain("reducing your margin by 7%");
    expect(zu).toContain("ngo-7%");
  });

  it("renders deterministic English and isiZulu phrasing for cash runway", () => {
    const payload = { cashOnHandCents: 255_000, restockCostCents: 117_800 };
    const en = phraseNudgeFallback("cash_runway", payload, "en");
    const zu = phraseNudgeFallback("cash_runway", payload, "zu");

    expect(en).toContain("Thursday");
    expect(zu).toContain("ngoLwesine");
    expect(en).toContain("R2550");
    expect(zu).toContain("R2550");
  });
});
