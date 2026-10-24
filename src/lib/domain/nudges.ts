import type { StageEvaluation } from "./stages";
import { NUDGE_THRESHOLDS } from "./thresholds";
import type {
  Business,
  BusinessMetrics,
  NudgeSeverity,
  Stage,
} from "./types";

export type NudgeRuleKey =
  | "margin_drop"
  | "cash_restock"
  | "cash_runway"
  | "stock_cover"
  | "savings_buffer"
  | "inactivity"
  | "stage_transition"
  | "separate_money";

export interface NudgeDraft {
  ruleKey: NudgeRuleKey;
  severity: NudgeSeverity;
  payload: Record<string, string | number | boolean | null>;
}

export const RULE_PRIORITY: NudgeRuleKey[] = [
  "cash_restock",
  "cash_runway",
  "margin_drop",
  "stock_cover",
  "inactivity",
  "savings_buffer",
  "stage_transition",
  "separate_money",
];

const ADVANCED_STAGES: Stage[] = ["stable", "grow", "enterprise"];

export function evaluateNudges(
  business: Business,
  metrics: BusinessMetrics,
  stageEvaluation: StageEvaluation,
): NudgeDraft[] {
  const drafts: NudgeDraft[] = [];

  if (
    metrics.nextRestockCostCents > 0 &&
    metrics.cashOnHandCents < metrics.nextRestockCostCents
  ) {
    drafts.push({
      ruleKey: "cash_restock",
      severity: "critical",
      payload: {
        cashCents: Math.round(metrics.cashOnHandCents),
        restockCostCents: metrics.nextRestockCostCents,
        shortfallCents: metrics.restockShortfallCents,
        day: "Thursday",
      },
    });
  } else if (
    metrics.cashRunwayDays !== null &&
    metrics.cashRunwayDays < NUDGE_THRESHOLDS.cashRunwayDays
  ) {
    drafts.push({
      ruleKey: "cash_runway",
      severity: "critical",
      payload: {
        runwayDays: metrics.cashRunwayDays,
        cashCents: Math.round(metrics.cashOnHandCents),
      },
    });
  }

  const marginDrop = metrics.previousWeekMarginPct - metrics.weeklyMarginPct;
  if (marginDrop >= NUDGE_THRESHOLDS.marginDropPoints) {
    drafts.push({
      ruleKey: "margin_drop",
      severity: "warning",
      payload: {
        dropPoints: Number(marginDrop.toFixed(1)),
        previousMarginPct: Number(metrics.previousWeekMarginPct.toFixed(1)),
        currentMarginPct: Number(metrics.weeklyMarginPct.toFixed(1)),
      },
    });
  }

  if (
    metrics.stockDaysCover !== null &&
    metrics.stockDaysCover < NUDGE_THRESHOLDS.stockCoverDays
  ) {
    drafts.push({
      ruleKey: "stock_cover",
      severity: "warning",
      payload: { stockDaysCover: metrics.stockDaysCover },
    });
  }

  if (metrics.daysSinceLastTransaction >= NUDGE_THRESHOLDS.inactivityDays) {
    drafts.push({
      ruleKey: "inactivity",
      severity: "info",
      payload: { days: metrics.daysSinceLastTransaction },
    });
  }

  if (
    metrics.savingsBufferWeeks < NUDGE_THRESHOLDS.savingsBufferWeeks &&
    !drafts.some((draft) => draft.ruleKey === "cash_restock")
  ) {
    drafts.push({
      ruleKey: "savings_buffer",
      severity: "warning",
      payload: {
        bufferWeeks: Number(metrics.savingsBufferWeeks.toFixed(1)),
        weeklyExpensesCents: Math.round(metrics.averageDailyExpenseCents * 7),
      },
    });
  }

  if (stageEvaluation.ready && stageEvaluation.next) {
    drafts.push({
      ruleKey: "stage_transition",
      severity: "info",
      payload: {
        from: stageEvaluation.current,
        to: stageEvaluation.next,
      },
    });
  }

  if (
    ADVANCED_STAGES.includes(business.stage) &&
    !business.onboarding.separatedMoney
  ) {
    drafts.push({
      ruleKey: "separate_money",
      severity: "info",
      payload: { stage: business.stage },
    });
  }

  return drafts.sort(
    (a, b) => RULE_PRIORITY.indexOf(a.ruleKey) - RULE_PRIORITY.indexOf(b.ruleKey),
  );
}

export function nextBestStepKey(
  drafts: NudgeDraft[],
  stageEvaluation: StageEvaluation,
): { ruleKey: NudgeRuleKey | "onboarding"; draft: NudgeDraft | null } {
  if (stageEvaluation.current === "idea") {
    return { ruleKey: "onboarding", draft: null };
  }
  const top = drafts[0];
  if (top) return { ruleKey: top.ruleKey, draft: top };
  return { ruleKey: "onboarding", draft: null };
}
