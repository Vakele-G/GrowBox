import { BottomNav } from "@/components/bottom-nav";
import { getRepository } from "@/lib/db/repository";
import { DEMO_BUSINESS_ID } from "@/lib/db/seed";
import { computeBusinessMetrics, evaluateWarnings } from "@/lib/domain/metrics";
import type { DailyTotal } from "@/lib/domain/types";
import { DashboardView } from "./dashboard-view";

export const metadata = {
  title: "Stage 3: Dashboard & Warnings",
};

export default async function DashboardPage() {
  const repo = getRepository();
  const business = await repo.getBusiness(DEMO_BUSINESS_ID);
  const transactions = await repo.getTransactions(DEMO_BUSINESS_ID);
  const ingredients = await repo.getIngredients(DEMO_BUSINESS_ID);
  const products = await repo.getProducts(DEMO_BUSINESS_ID);

  const metrics = computeBusinessMetrics(
    transactions,
    ingredients,
    products,
    business,
  );
  const warnings = evaluateWarnings(metrics);

  // Group daily totals
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
      <DashboardView
        metrics={metrics}
        warnings={warnings}
        dailyTotals={dailyTotals}
        businessName={business?.name ?? "Nomsa's Kitchen"}
        initialSeparatedMoney={business?.onboarding?.separatedMoney ?? false}
      />
      <BottomNav />
    </main>
  );
}
