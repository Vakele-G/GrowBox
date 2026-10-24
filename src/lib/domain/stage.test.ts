import { describe, expect, it } from "vitest";
import { detectStage } from "./stage";
import type { Business, BusinessMetrics, StageProgress } from "./types";

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
    savingsBufferWeeks: 1.1,
    nextRestockCostCents: 117_800,
    restockShortfallCents: 0,
    tradingDaysLast30: 25,
    loggedDaysLast30: 25,
    daysSinceLastTransaction: 0,
    daysSinceStageStart: 25,
    ...overrides,
  };
}

function createMockBusiness(overrides: Partial<Business> = {}): Business {
  return {
    id: "biz_test",
    ownerId: "owner_test",
    name: "Test Spaza",
    stage: "stable",
    municipality: "City of Johannesburg",
    language: "en",
    monthlyBudgetCents: 150_000,
    onboarding: null,
    createdAt: "2026-09-01T00:00:00+02:00",
    ...overrides,
  };
}

describe("detectStage", () => {
  it("detects Idea -> Launch readiness when launch plan and budget exist", () => {
    const biz = createMockBusiness({
      stage: "idea",
      monthlyBudgetCents: 150_000,
      onboarding: {
        completed: true,
        launchPlan: ["Apply for permit", "Buy starter ingredient pack"],
      },
    });
    const metrics = createMockMetrics();

    const result = detectStage(biz, metrics, null);
    expect(result.currentStage).toBe("idea");
    expect(result.nextStage).toBe("launch");
    expect(result.readyToAdvance).toBe(true);
    expect(result.criteria.every((c) => c.met)).toBe(true);
  });

  it("blocks Idea -> Launch if budget or launch plan missing", () => {
    const biz = createMockBusiness({
      stage: "idea",
      monthlyBudgetCents: 0,
      onboarding: null,
    });
    const metrics = createMockMetrics();

    const result = detectStage(biz, metrics, null);
    expect(result.readyToAdvance).toBe(false);
    expect(result.criteria.some((c) => !c.met)).toBe(true);
  });

  it("detects Launch -> Stable transition when trading days >= 10", () => {
    const biz = createMockBusiness({ stage: "launch" });
    const metrics = createMockMetrics({ tradingDaysLast30: 12 });

    const result = detectStage(biz, metrics, null);
    expect(result.currentStage).toBe("launch");
    expect(result.nextStage).toBe("stable");
    expect(result.readyToAdvance).toBe(true);
  });

  it("blocks Launch -> Stable if trading days < 10", () => {
    const biz = createMockBusiness({ stage: "launch" });
    const metrics = createMockMetrics({ tradingDaysLast30: 8 });

    const result = detectStage(biz, metrics, null);
    expect(result.readyToAdvance).toBe(false);
  });

  it("detects Stable -> Grow transition when 30d criteria are satisfied", () => {
    const biz = createMockBusiness({ stage: "stable" });
    const metrics = createMockMetrics({
      loggedDaysLast30: 28,
      fourWeekMarginPct: 56.4,
      savingsBufferWeeks: 1.2,
    });

    const result = detectStage(biz, metrics, null);
    expect(result.currentStage).toBe("stable");
    expect(result.nextStage).toBe("grow");
    expect(result.readyToAdvance).toBe(true);
    expect(result.criteria.length).toBe(3);
    expect(result.criteria.every((c) => c.met)).toBe(true);
  });

  it("blocks Stable -> Grow if savings buffer is less than 1 week", () => {
    const biz = createMockBusiness({ stage: "stable" });
    const metrics = createMockMetrics({
      loggedDaysLast30: 28,
      fourWeekMarginPct: 56.4,
      savingsBufferWeeks: 0.7, // insufficient buffer
    });

    const result = detectStage(biz, metrics, null);
    expect(result.readyToAdvance).toBe(false);
    const bufferCriterion = result.criteria.find((c) => c.label.includes("Savings buffer"));
    expect(bufferCriterion?.met).toBe(false);
  });

  it("blocks Stable -> Grow if 4-week margin is negative", () => {
    const biz = createMockBusiness({ stage: "stable" });
    const metrics = createMockMetrics({
      loggedDaysLast30: 28,
      fourWeekMarginPct: -2.5,
      savingsBufferWeeks: 1.2,
    });

    const result = detectStage(biz, metrics, null);
    expect(result.readyToAdvance).toBe(false);
  });

  it("detects Grow -> Enterprise when formalisation checks started and 60d trade", () => {
    const biz = createMockBusiness({ stage: "grow" });
    const metrics = createMockMetrics({ tradingDaysLast30: 29 });
    const progress: StageProgress = {
      businessId: "biz_test",
      stage: "grow",
      stageStartedAt: "2026-08-01T00:00:00+02:00",
      completedChecks: ["formalisation_started"],
      updatedAt: "2026-10-24T00:00:00+02:00",
    };

    const result = detectStage(biz, metrics, progress);
    expect(result.currentStage).toBe("grow");
    expect(result.nextStage).toBe("enterprise");
    expect(result.readyToAdvance).toBe(true);
  });
});
