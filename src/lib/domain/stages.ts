import { STAGE_THRESHOLDS } from "./thresholds";
import type { Business, BusinessMetrics, Stage } from "./types";

export const STAGE_ORDER: Stage[] = ["idea", "launch", "stable", "grow", "enterprise"];

const STAGE_LABELS: Record<Stage, string> = {
  idea: "Idea",
  launch: "Launch",
  stable: "Stable",
  grow: "Grow",
  enterprise: "Enterprise",
};

export function stageLabel(stage: Stage): string {
  return STAGE_LABELS[stage];
}

export function nextStage(stage: Stage): Stage | null {
  const index = STAGE_ORDER.indexOf(stage);
  return STAGE_ORDER[index + 1] ?? null;
}

export interface StageCriterion {
  key: string;
  labelEn: string;
  labelZu: string;
  met: boolean;
  current: string;
  target: string;
}

export interface StageEvaluation {
  current: Stage;
  next: Stage | null;
  ready: boolean;
  criteria: StageCriterion[];
}

export function evaluateStage(
  business: Business,
  metrics: BusinessMetrics,
  completedChecks: string[] = [],
): StageEvaluation {
  const next = nextStage(business.stage);
  const criteria: StageCriterion[] = [];

  if (business.stage === "idea") {
    const planSaved =
      business.onboarding.completed &&
      Boolean(business.onboarding.costing?.suggestedPriceCents);
    criteria.push({
      key: "launch_plan",
      labelEn: "Launch plan and startup budget saved",
      labelZu: "Uhlelo lokwethula nesabelomali sokuthuthuka kugciniwe",
      met: planSaved,
      current: planSaved ? "Saved" : "Not saved",
      target: "Saved",
    });
  }

  if (business.stage === "launch") {
    criteria.push({
      key: "ten_trading_days",
      labelEn: "10 trading days with sales in the last 21 days",
      labelZu: "Izinsuku eziyi-10 zokuhweba ezinokuthengisa ezinsukwini eziyi-21 ezedlule",
      met: metrics.tradingDaysLast30 >= STAGE_THRESHOLDS.launchToStableTradingDays,
      current: `${metrics.tradingDaysLast30} days`,
      target: `${STAGE_THRESHOLDS.launchToStableTradingDays} days`,
    });
  }

  if (business.stage === "stable") {
    criteria.push(
      {
        key: "trading_days",
        labelEn: "30+ days of trading history",
        labelZu: "Izinsuku ezingaphezu kwezingu-30 zomlando wokuhweba",
        met: metrics.daysSinceStageStart >= 30,
        current: `${metrics.daysSinceStageStart} days`,
        target: "30 days",
      },
      {
        key: "record_consistency",
        labelEn: "Logging on at least 20 of the last 30 days",
        labelZu: "Ukurekhoda okungenani ezinsukwini eziyi-20 kwezingu-30 ezedlule",
        met: metrics.loggedDaysLast30 >= STAGE_THRESHOLDS.stableToGrowLoggedDays,
        current: `${metrics.loggedDaysLast30} days`,
        target: `${STAGE_THRESHOLDS.stableToGrowLoggedDays} days`,
      },
      {
        key: "positive_margin",
        labelEn: "Positive 4-week margin",
        labelZu: "Inzuzo enhle yamasonto amane",
        met: metrics.fourWeekMarginPct > STAGE_THRESHOLDS.stableToGrowMinimumMarginPct,
        current: `${metrics.fourWeekMarginPct.toFixed(0)}%`,
        target: "> 0%",
      },
      {
        key: "savings_buffer",
        labelEn: "Savings buffer of at least 1 week",
        labelZu: "Isikhwama sokonga okungenani iviki elilodwa",
        met:
          metrics.savingsBufferWeeks >= STAGE_THRESHOLDS.stableToGrowSavingsBufferWeeks,
        current: `${metrics.savingsBufferWeeks.toFixed(1)} weeks`,
        target: `${STAGE_THRESHOLDS.stableToGrowSavingsBufferWeeks} week`,
      },
    );
  }

  if (business.stage === "grow") {
    criteria.push({
      key: "enterprise_history",
      labelEn: "60+ days of consistent history and formalisation started",
      labelZu: "Izinsuku ezingaphezu kwezingu-60 zomlando kanye nokuqala kokuhleleka",
      met:
        metrics.daysSinceStageStart >= STAGE_THRESHOLDS.growToEnterpriseHistoryDays &&
        completedChecks.includes("formalisation_started"),
      current: `${metrics.daysSinceStageStart} days`,
      target: "60 days + formalisation",
    });
  }

  return {
    current: business.stage,
    next,
    ready: criteria.length > 0 && criteria.every((criterion) => criterion.met),
    criteria,
  };
}
