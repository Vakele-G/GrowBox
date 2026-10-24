import { addDays, diffDays, lastNDates, today } from "./dates";
import type {
  Business,
  BusinessMetrics,
  DailyTotal,
  Product,
  StageProgress,
  Transaction,
} from "./types";

export function dailyTotals(
  transactions: Transaction[],
  dates?: string[],
): DailyTotal[] {
  const byDate = new Map<string, DailyTotal>();
  for (const date of dates ?? []) {
    byDate.set(date, {
      date,
      salesCents: 0,
      expensesCents: 0,
      profitCents: 0,
      transactionCount: 0,
    });
  }

  for (const tx of transactions) {
    const current =
      byDate.get(tx.occurredOn) ??
      ({
        date: tx.occurredOn,
        salesCents: 0,
        expensesCents: 0,
        profitCents: 0,
        transactionCount: 0,
      } satisfies DailyTotal);
    if (tx.type === "sale") current.salesCents += tx.amountCents;
    else current.expensesCents += tx.amountCents;
    current.profitCents = current.salesCents - current.expensesCents;
    current.transactionCount += 1;
    byDate.set(tx.occurredOn, current);
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function sumRange(
  transactions: Transaction[],
  from: string,
  to: string,
  options: { operatingOnly?: boolean } = {},
): { salesCents: number; expensesCents: number; profitCents: number } {
  let salesCents = 0;
  let expensesCents = 0;
  for (const tx of transactions) {
    if (tx.occurredOn < from || tx.occurredOn > to) continue;
    if (tx.type === "sale") salesCents += tx.amountCents;
    else if (!options.operatingOnly || tx.category !== "owner-draw") {
      expensesCents += tx.amountCents;
    }
  }
  return { salesCents, expensesCents, profitCents: salesCents - expensesCents };
}

export function marginPct(salesCents: number, expensesCents: number): number {
  if (salesCents <= 0) return 0;
  return ((salesCents - expensesCents) / salesCents) * 100;
}

export function cashOnHandCents(transactions: Transaction[]): number {
  return transactions.reduce(
    (total, tx) => total + (tx.type === "sale" ? tx.amountCents : -tx.amountCents),
    0,
  );
}

export function cashRunwayDays(
  cashCents: number,
  averageDailyExpenseCents: number,
): number | null {
  if (cashCents <= 0) return 0;
  if (averageDailyExpenseCents <= 0) return null;
  return Math.floor(cashCents / averageDailyExpenseCents);
}

export function stockDaysCover(
  stockUnitsOnHand: number | undefined,
  unitsSoldPerDay: number,
): number | null {
  if (stockUnitsOnHand === undefined) return null;
  if (unitsSoldPerDay <= 0) return stockUnitsOnHand > 0 ? 99 : 0;
  return Math.floor((stockUnitsOnHand / unitsSoldPerDay) * 10) / 10;
}

export function savingsBufferWeeks(
  cashCents: number,
  expensesLast28DaysCents: number,
): number {
  const averageWeeklyExpense = expensesLast28DaysCents / 4;
  if (averageWeeklyExpense <= 0) return cashCents > 0 ? 99 : 0;
  return Math.max(0, cashCents / averageWeeklyExpense);
}

export function unitsSoldInRange(
  transactions: Transaction[],
  from: string,
  to: string,
): number {
  return transactions.reduce((total, tx) => {
    if (tx.type !== "sale" || tx.occurredOn < from || tx.occurredOn > to) return total;
    return total + (tx.quantity ?? 0);
  }, 0);
}

export function computeMetrics(
  business: Business,
  products: Product[],
  transactions: Transaction[],
  stageProgress: StageProgress,
  now: string = today(),
): BusinessMetrics {
  void products;
  const last14From = addDays(now, -13);
  const last28From = addDays(now, -27);
  const last7From = addDays(now, -6);
  const previous7From = addDays(now, -13);
  const previous7To = addDays(now, -7);

  const all = sumRange(transactions, "0000-01-01", "9999-12-31", {
    operatingOnly: true,
  });
  const last14 = sumRange(transactions, last14From, now, { operatingOnly: true });
  const last28 = sumRange(transactions, last28From, now, { operatingOnly: true });
  const last7 = sumRange(transactions, last7From, now, { operatingOnly: true });
  const previous7 = sumRange(transactions, previous7From, previous7To, {
    operatingOnly: true,
  });
  const ownerWithdrawalsCents = transactions.reduce(
    (total, tx) =>
      tx.category === "owner-draw" ? total + tx.amountCents : total,
    0,
  );

  const loggedDates = new Set(transactions.map((tx) => tx.occurredOn));
  const saleDates = new Set(
    transactions.filter((tx) => tx.type === "sale").map((tx) => tx.occurredOn),
  );
  const loggedDaysLast30 = lastNDates(30, now).filter((date) => loggedDates.has(date))
    .length;
  const tradingDaysLast30 = lastNDates(30, now).filter((date) => saleDates.has(date))
    .length;

  const expensesLast14 = last14.expensesCents;
  const averageDailyExpenseCents = expensesLast14 / 14;
  const averageDailySalesCents = last14.salesCents / 14;

  const lastTransactionDate = transactions.reduce<string | null>(
    (latest, tx) => (latest === null || tx.occurredOn > latest ? tx.occurredOn : latest),
    null,
  );
  const daysSinceLastTransaction = lastTransactionDate
    ? Math.max(0, diffDays(lastTransactionDate, now))
    : 999;

  const unitsLast7 = unitsSoldInRange(transactions, last7From, now);
  const unitsPerDay = unitsLast7 / 7;
  const cash = cashOnHandCents(transactions);

  const stockExpensesLast7 = transactions.reduce((total, tx) => {
    if (
      tx.type === "expense" &&
      tx.category === "stock" &&
      tx.occurredOn >= last7From &&
      tx.occurredOn <= now
    ) {
      return total + tx.amountCents;
    }
    return total;
  }, 0);
  const nextRestockCostCents = Math.round(stockExpensesLast7 * 1.4);

  return {
    cashOnHandCents: cash,
    totalSalesCents: all.salesCents,
    totalExpensesCents: all.expensesCents,
    ownerWithdrawalsCents,
    last14SalesCents: last14.salesCents,
    last14ExpensesCents: last14.expensesCents,
    last14ProfitCents: last14.profitCents,
    fourWeekSalesCents: last28.salesCents,
    fourWeekExpensesCents: last28.expensesCents,
    fourWeekMarginPct: marginPct(last28.salesCents, last28.expensesCents),
    previousWeekMarginPct: marginPct(previous7.salesCents, previous7.expensesCents),
    weeklyMarginPct: marginPct(last7.salesCents, last7.expensesCents),
    averageDailyExpenseCents,
    averageDailySalesCents,
    cashRunwayDays: cashRunwayDays(cash, averageDailyExpenseCents),
    stockDaysCover: stockDaysCover(business.onboarding?.stockUnitsOnHand, unitsPerDay),
    savingsBufferWeeks: savingsBufferWeeks(cash, last28.expensesCents),
    nextRestockCostCents,
    restockShortfallCents: Math.max(0, nextRestockCostCents - cash),
    tradingDaysLast30,
    loggedDaysLast30,
    daysSinceLastTransaction,
    daysSinceStageStart: Math.max(0, diffDays(stageProgress.stageStartedAt, now)),
  };
}
