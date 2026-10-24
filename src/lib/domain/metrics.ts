import { addDays, diffDays, parseDateString, today } from "./dates";
import type {
  Business,
  BusinessMetrics,
  Ingredient,
  Product,
  Transaction,
} from "./types";

export type { BusinessMetrics };

export interface WarningTrigger {
  key: string;
  severity: "info" | "warning" | "critical";
  title: string;
  messageEn: string;
  messageZu: string;
  calculationExplanation: string;
}

export function computeBusinessMetrics(
  transactions: Transaction[],
  ingredients: Ingredient[] = [],
  products: Product[] = [],
  business?: Business | null,
  now: string = today(),
): BusinessMetrics {
  const sorted = [...transactions].sort((a, b) => b.occurredOn.localeCompare(a.occurredOn));

  // All-time totals
  let totalSalesCents = 0;
  let totalExpensesCents = 0;
  let ownerWithdrawalsCents = 0;

  for (const t of sorted) {
    if (t.type === "sale") {
      totalSalesCents += t.amountCents;
    } else {
      totalExpensesCents += t.amountCents;
      if (t.category === "owner-draw") {
        ownerWithdrawalsCents += t.amountCents;
      }
    }
  }

  const cashOnHandCents = totalSalesCents - totalExpensesCents;

  // Window calculations
  const date14DaysAgo = addDays(now, -14);
  const date28DaysAgo = addDays(now, -28);
  const date7DaysAgo = addDays(now, -7);

  const txLast14 = sorted.filter((t) => t.occurredOn >= date14DaysAgo);
  const txLast28 = sorted.filter((t) => t.occurredOn >= date28DaysAgo);
  const txCurrentWeek = sorted.filter((t) => t.occurredOn >= date7DaysAgo);
  const txPrevWeek = sorted.filter(
    (t) => t.occurredOn >= date14DaysAgo && t.occurredOn < date7DaysAgo,
  );

  const last14SalesCents = txLast14
    .filter((t) => t.type === "sale")
    .reduce((s, t) => s + t.amountCents, 0);
  const last14ExpensesCents = txLast14
    .filter((t) => t.type === "expense" && t.category !== "owner-draw")
    .reduce((s, t) => s + t.amountCents, 0);
  const last14ProfitCents = last14SalesCents - last14ExpensesCents;

  const fourWeekSalesCents = txLast28
    .filter((t) => t.type === "sale")
    .reduce((s, t) => s + t.amountCents, 0);
  const fourWeekExpensesCents = txLast28
    .filter((t) => t.type === "expense" && t.category !== "owner-draw")
    .reduce((s, t) => s + t.amountCents, 0);
  const fourWeekMarginPct =
    fourWeekSalesCents > 0
      ? ((fourWeekSalesCents - fourWeekExpensesCents) / fourWeekSalesCents) * 100
      : 0;

  // Week on week margin
  const weekSales = txCurrentWeek
    .filter((t) => t.type === "sale")
    .reduce((s, t) => s + t.amountCents, 0);
  const weekExp = txCurrentWeek
    .filter((t) => t.type === "expense" && t.category !== "owner-draw")
    .reduce((s, t) => s + t.amountCents, 0);
  const weeklyMarginPct = weekSales > 0 ? ((weekSales - weekExp) / weekSales) * 100 : 0;

  const prevWeekSales = txPrevWeek
    .filter((t) => t.type === "sale")
    .reduce((s, t) => s + t.amountCents, 0);
  const prevWeekExp = txPrevWeek
    .filter((t) => t.type === "expense" && t.category !== "owner-draw")
    .reduce((s, t) => s + t.amountCents, 0);
  const previousWeekMarginPct =
    prevWeekSales > 0 ? ((prevWeekSales - prevWeekExp) / prevWeekSales) * 100 : 0;

  // Trading days & averages (last 30 days)
  const date30DaysAgo = addDays(now, -30);
  const txLast30 = sorted.filter((t) => t.occurredOn >= date30DaysAgo);
  const loggedDays = new Set(txLast30.map((t) => t.occurredOn));
  const tradingDays = new Set(
    txLast30.filter((t) => t.type === "sale").map((t) => t.occurredOn),
  );

  const loggedDaysLast30 = loggedDays.size;
  const tradingDaysLast30 = tradingDays.size;

  const denominatorDays = Math.max(loggedDaysLast30, 14);
  const totalStockAndOpExp30 = txLast30
    .filter((t) => t.type === "expense" && t.category !== "owner-draw")
    .reduce((s, t) => s + t.amountCents, 0);

  const averageDailyExpenseCents = Math.round(totalStockAndOpExp30 / denominatorDays);
  const totalSales30 = txLast30
    .filter((t) => t.type === "sale")
    .reduce((s, t) => s + t.amountCents, 0);
  const averageDailySalesCents = Math.round(totalSales30 / denominatorDays);

  // Next restock cost (essential ingredient packs + gas refill per PROJECT_SPEC.md §6.3)
  let nextRestockCostCents = 0;
  if (ingredients.length > 0) {
    nextRestockCostCents =
      ingredients.reduce((s, i) => s + i.packPriceCents, 0) + 45_000;
  }
  if (nextRestockCostCents === 0) {
    nextRestockCostCents = 117_800;
  }

  // Cash Runway: days until cash cannot cover next restock (PROJECT_SPEC.md §6.3)
  const restockShortfallCents = Math.max(0, nextRestockCostCents - cashOnHandCents);
  let cashRunwayDays: number | null = null;
  if (averageDailyExpenseCents > 0) {
    const bufferAboveRestock = cashOnHandCents - nextRestockCostCents;
    cashRunwayDays = Math.max(0, Math.round(bufferAboveRestock / averageDailyExpenseCents));
  }

  // Stock Days Cover
  const unitsOnHand = business?.onboarding?.stockUnitsOnHand ?? 120;
  let stockDaysCover: number | null = null;
  const gwinyaProduct = products.find((p) => p.unitLabel.includes("gwinya")) ?? products[0];
  const gwinyaPrice = gwinyaProduct?.sellingPriceCents ?? 500;
  const estimatedDailyUnits =
    averageDailySalesCents > 0 ? Math.round(averageDailySalesCents / gwinyaPrice) : 50;

  if (estimatedDailyUnits > 0) {
    stockDaysCover = Math.max(0, Math.round(unitsOnHand / estimatedDailyUnits));
  }

  // Savings buffer (weeks of operating expenses)
  const oneWeekExpenseCents = Math.max(averageDailyExpenseCents * 7, 70_000);
  const savingsBufferWeeks =
    oneWeekExpenseCents > 0
      ? parseFloat((cashOnHandCents / oneWeekExpenseCents).toFixed(1))
      : 0;

  // Recency
  const lastTxDate = sorted[0]?.occurredOn ?? now;
  const daysSinceLastTransaction = Math.max(0, diffDays(lastTxDate, now));
  const stageStartedAt = business?.createdAt ? business.createdAt.slice(0, 10) : now;
  const daysSinceStageStart = Math.max(0, diffDays(stageStartedAt, now));

  return {
    cashOnHandCents,
    totalSalesCents,
    totalExpensesCents,
    ownerWithdrawalsCents,
    last14SalesCents,
    last14ExpensesCents,
    last14ProfitCents,
    fourWeekSalesCents,
    fourWeekExpensesCents,
    fourWeekMarginPct,
    previousWeekMarginPct,
    weeklyMarginPct,
    averageDailyExpenseCents,
    averageDailySalesCents,
    cashRunwayDays,
    stockDaysCover,
    savingsBufferWeeks,
    nextRestockCostCents,
    restockShortfallCents,
    tradingDaysLast30,
    loggedDaysLast30,
    daysSinceLastTransaction,
    daysSinceStageStart,
  };
}

/**
 * Deterministic warning evaluation.
 * Thresholds defined per PROJECT_SPEC.md §6.4.
 */
export function evaluateWarnings(
  metrics: BusinessMetrics,
  now: string = today(),
): WarningTrigger[] {
  const warnings: WarningTrigger[] = [];

  // 1. Margin dropped >= 5 percentage points week-on-week
  const marginDrop = metrics.previousWeekMarginPct - metrics.weeklyMarginPct;
  if (metrics.previousWeekMarginPct > 0 && marginDrop >= 5) {
    warnings.push({
      key: "margin_drop",
      severity: "warning",
      title: "Margin Drop Detected",
      messageEn: `Your gross margin dropped by ${marginDrop.toFixed(0)}% this week (from ${metrics.previousWeekMarginPct.toFixed(0)}% to ${metrics.weeklyMarginPct.toFixed(0)}%), driven by rising cooking oil and flour prices. Consider adjusting your selling price.`,
      messageZu: `Inzuzo yakho yehle ngo-${marginDrop.toFixed(0)}% kuleli sonto (isuka ku-${metrics.previousWeekMarginPct.toFixed(0)}% iya ku-${metrics.weeklyMarginPct.toFixed(0)}%), ngenxa yokwenyuka kwamanani kawoyela nowofulawa. Cabanga ngokulungisa intengo yokuthengisa.`,
      calculationExplanation: `Previous week: ${metrics.previousWeekMarginPct.toFixed(1)}% | Current week: ${metrics.weeklyMarginPct.toFixed(1)}% | Difference: -${marginDrop.toFixed(1)}% (Threshold: >= 5%)`,
    });
  }

  // 2. Cash Runway <= 4 days (produces the Thursday cash warning on seeded persona)
  if (metrics.cashRunwayDays !== null && metrics.cashRunwayDays <= 5) {
    const depletionDate = addDays(now, metrics.cashRunwayDays);
    const weekdayLong = new Intl.DateTimeFormat("en-ZA", {
      timeZone: "Africa/Johannesburg",
      weekday: "long",
    }).format(parseDateString(depletionDate));

    warnings.push({
      key: "cash_runway",
      severity: metrics.cashRunwayDays <= 2 ? "critical" : "warning",
      title: "Restock Cash Warning",
      messageEn: `At this rate you will run out of cash for stock on ${weekdayLong}. Available cash: R${(metrics.cashOnHandCents / 100).toFixed(0)} vs next restock requirement of R${(metrics.nextRestockCostCents / 100).toFixed(0)}.`,
      messageZu: `Ngalo leli zinga uzophelelwa yimali yesitoko ngo-${weekdayLong}. Imali ekhona: R${(metrics.cashOnHandCents / 100).toFixed(0)} uma iqhathaniswa nesidingo sesitoko se-R${(metrics.nextRestockCostCents / 100).toFixed(0)}.`,
      calculationExplanation: `Available cash: R${(metrics.cashOnHandCents / 100).toFixed(0)} minus next restock: R${(metrics.nextRestockCostCents / 100).toFixed(0)} = R${((metrics.cashOnHandCents - metrics.nextRestockCostCents) / 100).toFixed(0)} ÷ Daily expense: R${(metrics.averageDailyExpenseCents / 100).toFixed(0)} = ${metrics.cashRunwayDays} days of runway (landing on ${weekdayLong}).`,
    });
  }

  // 3. Stock days cover < 1 day
  if (metrics.stockDaysCover !== null && metrics.stockDaysCover < 1) {
    warnings.push({
      key: "stock_cover",
      severity: "critical",
      title: "Low Stock Cover",
      messageEn: "Your stock on hand covers less than 1 day of sales. Re-order ingredients today to avoid missing peak trade.",
      messageZu: "Isitoko sakho esikhona sihlanganisa ngaphansi kosuku olulodwa lokuthengisa. Oda izithako kabusha namuhla.",
      calculationExplanation: `Stock cover: ${metrics.stockDaysCover} days at current daily sales volume (Threshold: < 1 day).`,
    });
  }

  // 4. Savings buffer < 1 week of expenses
  if (metrics.savingsBufferWeeks < 1) {
    warnings.push({
      key: "savings_buffer",
      severity: "warning",
      title: "Savings Buffer Low",
      messageEn: `Your cash buffer covers ${metrics.savingsBufferWeeks} weeks of expenses. Build a 1-week safety buffer (R${((metrics.averageDailyExpenseCents * 7) / 100).toFixed(0)}) to protect your hustle from price shocks.`,
      messageZu: `Isivikelo sakho semali sihlanganisa amasonto angu-${metrics.savingsBufferWeeks} ezindleko. Yakha isivikelo sesonto elilodwa ukuze uvikele ibhizinisi lakho.`,
      calculationExplanation: `Available cash: R${(metrics.cashOnHandCents / 100).toFixed(0)} | 1-week target: R${((metrics.averageDailyExpenseCents * 7) / 100).toFixed(0)} (Ratio: ${metrics.savingsBufferWeeks}x).`,
    });
  }

  // 5. Inactivity: no logs in 2+ days
  if (metrics.daysSinceLastTransaction >= 2) {
    warnings.push({
      key: "inactivity",
      severity: "info",
      title: "Keep Records Fresh",
      messageEn: `No transactions have been logged for ${metrics.daysSinceLastTransaction} days. Log today's sales to keep your credit record unbroken.`,
      messageZu: `Azikho izinkokhelo ezirekhodiwe izinsuku ezingu-${metrics.daysSinceLastTransaction}. Rekhoda ukuthengisa kwanamuhla.`,
      calculationExplanation: `Days since last transaction: ${metrics.daysSinceLastTransaction} (Threshold: >= 2 days).`,
    });
  }

  return warnings;
}

export { computeBusinessMetrics as calculateMetrics };
