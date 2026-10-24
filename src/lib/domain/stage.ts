import type { Business, BusinessMetrics, Stage, StageProgress } from "./types";

export interface StageCriterion {
  label: string;
  met: boolean;
}

export interface StageDetectionResult {
  currentStage: Stage;
  nextStage: Stage | null;
  readyToAdvance: boolean;
  criteria: StageCriterion[];
  headline: string;
  nextBestStep: string;
}

/**
 * Deterministic stage detection rules from PROJECT_SPEC.md §6.4.
 */
export function detectStage(
  business: Business,
  metrics: BusinessMetrics,
  stageProgress?: StageProgress | null,
): StageDetectionResult {
  const currentStage: Stage = stageProgress?.stage ?? business.stage ?? "idea";

  if (currentStage === "idea") {
    const hasLaunchPlan = Boolean(
      business.onboarding?.completed &&
        business.onboarding?.launchPlan &&
        business.onboarding.launchPlan.length > 0,
    );
    const hasBudget = (business.monthlyBudgetCents ?? 0) > 0;

    const criteria: StageCriterion[] = [
      { label: "Startup budget saved and recorded", met: hasBudget },
      { label: "Costing & launch plan completed", met: hasLaunchPlan },
    ];
    const ready = criteria.every((c) => c.met);

    return {
      currentStage: "idea",
      nextStage: "launch",
      readyToAdvance: ready,
      criteria,
      headline: ready
        ? "Launch plan ready! You are ready to start trading."
        : "Complete your costing and launch checklist to begin trading.",
      nextBestStep: ready
        ? "Secure your municipal trading spot and purchase your first ingredient pack."
        : "Complete the Stage 1 Costing Wizard to confirm viability.",
    };
  }

  if (currentStage === "launch") {
    const tradingDays = metrics.tradingDaysLast30;
    const criteria: StageCriterion[] = [
      {
        label: "At least 10 active trading days with recorded sales",
        met: tradingDays >= 10,
      },
    ];
    const ready = criteria.every((c) => c.met);

    return {
      currentStage: "launch",
      nextStage: "stable",
      readyToAdvance: ready,
      criteria,
      headline: ready
        ? "Consistent trading established! Move to Stable stage."
        : `Building trade consistency: ${tradingDays}/10 trading days logged.`,
      nextBestStep: ready
        ? "Review your 14-day cash flow dashboard and establish your savings buffer."
        : "Log every sale and expense daily in GrowBox.",
    };
  }

  if (currentStage === "stable") {
    const criteria: StageCriterion[] = [
      {
        label: "Consistent trading (logged on ≥ 20 of last 30 days)",
        met: metrics.loggedDaysLast30 >= 20,
      },
      {
        label: "Positive 4-week gross margin",
        met: metrics.fourWeekMarginPct > 0,
      },
      {
        label: "Savings buffer covers ≥ 1 week of expenses",
        met: metrics.savingsBufferWeeks >= 1,
      },
    ];
    const ready = criteria.every((c) => c.met);

    return {
      currentStage: "stable",
      nextStage: "grow",
      readyToAdvance: ready,
      criteria,
      headline: ready
        ? "You're ready to grow! Your track record qualifies you for expansion."
        : "Maintain daily logging and build your cash buffer to prepare for expansion.",
      nextBestStep: ready
        ? "Explore equipment expansion: evaluate second-fryer affordability and payback."
        : "Protect your cash runway and keep business and personal money separated.",
    };
  }

  if (currentStage === "grow") {
    const criteria: StageCriterion[] = [
      {
        label: "60+ days of consistent trading history",
        met: metrics.tradingDaysLast30 >= 28,
      },
      {
        label: "Formalisation tasks started (CIPC/Bank account)",
        met: (stageProgress?.completedChecks ?? []).includes("formalisation_started"),
      },
    ];
    const ready = criteria.every((c) => c.met);

    return {
      currentStage: "grow",
      nextStage: "enterprise",
      readyToAdvance: ready,
      criteria,
      headline: ready
        ? "Enterprise ready! Ready for formal credit assessment and business accounts."
        : "Growing capacity: building formal funding documentation and equipment.",
      nextBestStep: "Open an FNB Business Account and prepare your verified trading pack.",
    };
  }

  return {
    currentStage: "enterprise",
    nextStage: null,
    readyToAdvance: false,
    criteria: [],
    headline: "Enterprise: Formalized South African business.",
    nextBestStep: "Submit credit pack for bank financing or multi-outlet rollout.",
  };
}
