export interface NudgeThresholds {
  marginDropPoints: number;
  cashRunwayDays: number;
  stockCoverDays: number;
  savingsBufferWeeks: number;
  inactivityDays: number;
}

export interface StageThresholds {
  launchToStableTradingDays: number;
  stableToGrowTradingDays: number;
  stableToGrowLoggedDays: number;
  stableToGrowMinimumMarginPct: number;
  stableToGrowSavingsBufferWeeks: number;
  growToEnterpriseHistoryDays: number;
}

export const NUDGE_THRESHOLDS: NudgeThresholds = {
  marginDropPoints: 5,
  cashRunwayDays: 3,
  stockCoverDays: 1,
  savingsBufferWeeks: 1,
  inactivityDays: 2,
};

export const STAGE_THRESHOLDS: StageThresholds = {
  launchToStableTradingDays: 10,
  stableToGrowTradingDays: 20,
  stableToGrowLoggedDays: 20,
  stableToGrowMinimumMarginPct: 0,
  stableToGrowSavingsBufferWeeks: 1,
  growToEnterpriseHistoryDays: 60,
};

export const HEALTH_SCORE_WEIGHTS = {
  profitability: 25,
  cashBuffer: 20,
  recordConsistency: 20,
  marginStability: 15,
  savingsDiscipline: 10,
  complianceProgress: 10,
} as const;
