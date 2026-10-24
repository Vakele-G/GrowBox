import { HEALTH_SCORE_WEIGHTS } from "./thresholds";
import type {
  BusinessMetrics,
  HealthBand,
  HealthScoreComponents,
} from "./types";

export interface HealthResult {
  score: number;
  band: HealthBand;
  components: HealthScoreComponents;
  improvements: string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function healthBand(score: number): HealthBand {
  if (score >= 80) return "ready";
  if (score >= 60) return "bankable";
  if (score >= 40) return "emerging";
  return "building";
}

export const BAND_LABELS: Record<HealthBand, string> = {
  building: "Building",
  emerging: "Emerging",
  bankable: "Bankable-track",
  ready: "Ready",
};

export function computeHealthScore(
  metrics: BusinessMetrics,
  complianceProgress: number,
): HealthResult {
  const profitability = (clamp(metrics.fourWeekMarginPct, 0, 50) / 50) *
    HEALTH_SCORE_WEIGHTS.profitability;
  const cashBuffer = (clamp(metrics.savingsBufferWeeks, 0, 4) / 4) *
    HEALTH_SCORE_WEIGHTS.cashBuffer;
  const recordConsistency = (clamp(metrics.loggedDaysLast30, 0, 30) / 30) *
    HEALTH_SCORE_WEIGHTS.recordConsistency;
  const marginChange = Math.abs(
    metrics.previousWeekMarginPct - metrics.weeklyMarginPct,
  );
  const marginStability =
    HEALTH_SCORE_WEIGHTS.marginStability - clamp(marginChange * 0.8, 0, 15);
  const savingsDiscipline = (clamp(metrics.savingsBufferWeeks, 0, 4) / 4) *
    HEALTH_SCORE_WEIGHTS.savingsDiscipline;
  const compliance = clamp(complianceProgress, 0, 1) *
    HEALTH_SCORE_WEIGHTS.complianceProgress;

  const components: HealthScoreComponents = {
    profitability: Number(profitability.toFixed(1)),
    cashBuffer: Number(cashBuffer.toFixed(1)),
    recordConsistency: Number(recordConsistency.toFixed(1)),
    marginStability: Number(marginStability.toFixed(1)),
    savingsDiscipline: Number(savingsDiscipline.toFixed(1)),
    complianceProgress: Number(compliance.toFixed(1)),
  };

  const score = Math.round(
    components.profitability +
      components.cashBuffer +
      components.recordConsistency +
      components.marginStability +
      components.savingsDiscipline +
      components.complianceProgress,
  );

  const improvements: string[] = [];
  if (metrics.fourWeekMarginPct < 40) {
    improvements.push(
      "Raise your margin towards 40% by reviewing ingredient costs and prices.",
    );
  }
  if (metrics.savingsBufferWeeks < 2) {
    improvements.push("Build a cash buffer of at least two weeks of expenses.");
  }
  if (metrics.loggedDaysLast30 < 25) {
    improvements.push("Log every trading day - aim for 25 of the last 30 days.");
  }
  if (marginChange > 5) {
    improvements.push("Keep your ingredient prices and selling prices stable.");
  }
  if (complianceProgress < 0.5) {
    improvements.push("Complete more launch checklist tasks, like food handling.");
  }
  if (improvements.length === 0) {
    improvements.push("Keep your current rhythm going for another month.");
  }

  return {
    score: clamp(score, 0, 100),
    band: healthBand(score),
    components,
    improvements,
  };
}
