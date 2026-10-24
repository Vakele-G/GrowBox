import { BottomNav } from "@/components/bottom-nav";
import { getRepository } from "@/lib/db/repository";
import { DEMO_BUSINESS_ID } from "@/lib/db/seed";
import type { DailyTotal } from "@/lib/domain/types";
import { LedgerView } from "./ledger-view";

export const metadata = {
  title: "Ledger",
};

export default async function LedgerPage() {
  const repo = getRepository();
  const transactions = await repo.getTransactions(DEMO_BUSINESS_ID);

  // Compute daily totals
  const dailyMap = new Map<string, DailyTotal>();
  for (const t of transactions) {
    const existing = dailyMap.get(t.occurredOn) ?? {
      date: t.occurredOn,
      salesCents: 0,
      expensesCents: 0,
      profitCents: 0,
      transactionCount: 0,
    };
    if (t.type === "sale") {
      existing.salesCents += t.amountCents;
    } else {
      existing.expensesCents += t.amountCents;
    }
    existing.profitCents = existing.salesCents - existing.expensesCents;
    existing.transactionCount += 1;
    dailyMap.set(t.occurredOn, existing);
  }

  const dailyTotals = Array.from(dailyMap.values()).sort((a, b) =>
    b.date.localeCompare(a.date),
  );

  return (
    <main className="pb-16">
      <LedgerView initialTransactions={transactions} dailyTotals={dailyTotals} />
      <BottomNav />
    </main>
  );
}
