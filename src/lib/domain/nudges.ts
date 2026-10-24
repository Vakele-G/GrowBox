import { today } from "./dates";
import type { StageDetectionResult } from "./stage";
import type { Business, BusinessMetrics, Nudge } from "./types";

export type NudgeRuleKey =
  | "margin_drop"
  | "cash_restock"
  | "cash_runway"
  | "stock_cover"
  | "savings_buffer"
  | "inactivity"
  | "stage_transition"
  | "separate_money";

export interface NextBestStep {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  badge: string;
}

/**
 * Evaluates business metrics and stage status to generate active nudges.
 */
export function generateNudges(
  business: Business,
  metrics: BusinessMetrics,
  stageInfo: StageDetectionResult,
  now: string = today(),
): Nudge[] {
  const nudges: Nudge[] = [];
  const businessId = business.id;

  // 1. Stage Transition Trigger (Stable -> Grow)
  if (stageInfo.readyToAdvance && stageInfo.nextStage === "grow") {
    nudges.push({
      id: "nudge_stage_grow_ready",
      businessId,
      ruleKey: "stage_transition",
      severity: "info",
      payload: { targetStage: "grow" },
      messageEn:
        "You're ready to grow! Your 30 days of consistent, profitable trading qualify you for equipment expansion. Evaluate second-fryer affordability.",
      messageZu:
        "Usukulungele ukukhula! Izinsuku zakho ezingu-30 zokuhweba okuletha inzuzo zikuvumela ukuthi wandise okokusebenza. Hlola ukuthengwa kwesibili kwesitofu.",
      status: "new",
      createdAt: `${now}T08:00:00+02:00`,
    });
  }

  // 2. Margin Drop Trigger (>= 5% drop week-on-week)
  const marginDrop = metrics.previousWeekMarginPct - metrics.weeklyMarginPct;
  if (metrics.previousWeekMarginPct > 0 && marginDrop >= 5) {
    nudges.push({
      id: "nudge_margin_drop",
      businessId,
      ruleKey: "margin_drop",
      severity: "warning",
      payload: {
        dropPct: Math.round(marginDrop),
        prevMargin: Math.round(metrics.previousWeekMarginPct),
        currentMargin: Math.round(metrics.weeklyMarginPct),
      },
      messageEn: `Cooking oil and flour prices increased this week, reducing your margin by ${Math.round(marginDrop)}% (from ${Math.round(metrics.previousWeekMarginPct)}% to ${Math.round(metrics.weeklyMarginPct)}%). Consider increasing your gwinya price by 50c or buying oil in 20L bulk.`,
      messageZu: `Amanani kawoyela nofulawa enyukile kuleli sonto, anciphisa inzuzo yakho ngo-${Math.round(marginDrop)}%. Cabanga ngokukhuphula intengo ngamasenti angu-50 noma ukuthenga uwoyela omningi we-20L.`,
      status: "new",
      createdAt: `${now}T09:00:00+02:00`,
    });
  }

  // 3. Cash Runway Warning (<= 4 days, landing on Thursday for Nomsa)
  if (metrics.cashRunwayDays !== null && metrics.cashRunwayDays <= 4) {
    nudges.push({
      id: "nudge_cash_runway",
      businessId,
      ruleKey: "cash_runway",
      severity: metrics.cashRunwayDays <= 2 ? "critical" : "warning",
      payload: {
        runwayDays: metrics.cashRunwayDays,
        cashOnHandCents: metrics.cashOnHandCents,
        restockCostCents: metrics.nextRestockCostCents,
      },
      messageEn: `At this rate you will run out of cash for stock on Thursday. You have R${(metrics.cashOnHandCents / 100).toFixed(0)} available, and next restock needs R${(metrics.nextRestockCostCents / 100).toFixed(0)}. Hold back non-essential owner withdrawals.`,
      messageZu: `Ngalo leli zinga uzophelelwa yimali yesitoko ngoLwesine. Unemali ekhona engu-R${(metrics.cashOnHandCents / 100).toFixed(0)}, kanti isitoko esilandelayo sidinga u-R${(metrics.nextRestockCostCents / 100).toFixed(0)}. Misa ukukhipha imali okungabalulekile.`,
      status: "new",
      createdAt: `${now}T10:00:00+02:00`,
    });
  }

  // 4. Stock Days Cover (< 1 day)
  if (metrics.stockDaysCover !== null && metrics.stockDaysCover < 1) {
    nudges.push({
      id: "nudge_stock_cover",
      businessId,
      ruleKey: "stock_cover",
      severity: "critical",
      payload: { stockDaysCover: metrics.stockDaysCover },
      messageEn:
        "Your stock covers less than 1 day of trade. Restock flour and oil today so you do not run dry during morning taxi peak.",
      messageZu:
        "Isitoko sakho sihlanganisa ngaphansi kosuku olulodwa. Thenga ufulawa nawoyela namuhla.",
      status: "new",
      createdAt: `${now}T11:00:00+02:00`,
    });
  }

  // 5. Savings Buffer Low (< 1.0 week)
  if (metrics.savingsBufferWeeks < 1) {
    nudges.push({
      id: "nudge_savings_buffer",
      businessId,
      ruleKey: "savings_buffer",
      severity: "warning",
      payload: { bufferWeeks: metrics.savingsBufferWeeks },
      messageEn: `Your cash buffer is ${metrics.savingsBufferWeeks}x weekly expenses. Retain R180 more this week to build your 1-week safety cushion.`,
      messageZu: `Isivikelo sakho semali sincane. Beka u-R180 kuleli sonto ukuze wakhe isivikelo sesonto elilodwa.`,
      status: "new",
      createdAt: `${now}T12:00:00+02:00`,
    });
  }

  // 6. Inactivity (>= 2 days without logging)
  if (metrics.daysSinceLastTransaction >= 2) {
    nudges.push({
      id: "nudge_inactivity",
      businessId,
      ruleKey: "inactivity",
      severity: "info",
      payload: { days: metrics.daysSinceLastTransaction },
      messageEn: `You have not logged transactions for ${metrics.daysSinceLastTransaction} days. Log today's sales to keep your verified credit track record unbroken.`,
      messageZu: `Awukarekhodi ukuthengisa izinsuku ezingu-${metrics.daysSinceLastTransaction}. Rekhoda namuhla ukuze ugcine irekhodi lakho lisesimweni esihle.`,
      status: "new",
      createdAt: `${now}T13:00:00+02:00`,
    });
  }

  return nudges;
}

/**
 * Determines the single top-priority "Next Best Step" for the entrepreneur.
 */
export function determineNextBestStep(
  stageInfo: StageDetectionResult,
  nudges: Nudge[],
  _metrics?: BusinessMetrics,
): NextBestStep {
  // 1. Stage transition ready (highest priority positive step)
  if (stageInfo.readyToAdvance && stageInfo.nextStage === "grow") {
    return {
      title: "You're ready to grow!",
      description:
        "Your 30-day trading record proves consistent profit. Calculate if a second commercial fryer pays for itself.",
      actionLabel: "Explore Second Fryer Affordability →",
      actionHref: "/dashboard",
      badge: "Stage Up",
    };
  }

  // 2. Critical Cash Runway Warning
  const cashNudge = nudges.find((n) => n.ruleKey === "cash_runway" && n.status === "new");
  if (cashNudge) {
    return {
      title: "Protect Thursday Stock Cash",
      description: cashNudge.messageEn,
      actionLabel: "View Cash Flow & Runway Forecast →",
      actionHref: "/dashboard",
      badge: "Action Required",
    };
  }

  // 3. Margin Drop Alert
  const marginNudge = nudges.find((n) => n.ruleKey === "margin_drop" && n.status === "new");
  if (marginNudge) {
    return {
      title: "Oil Price Surge: Protect Your Margin",
      description: marginNudge.messageEn,
      actionLabel: "Review Costing & Set New Price →",
      actionHref: "/wizard",
      badge: "Price Alert",
    };
  }

  // 4. Default: Stage Next Best Step
  return {
    title: "Continue Building Track Record",
    description: stageInfo.nextBestStep,
    actionLabel: "Log Today's Sales →",
    actionHref: "/log",
    badge: `Stage: ${stageInfo.currentStage.toUpperCase()}`,
  };
}
