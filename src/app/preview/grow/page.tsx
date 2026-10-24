import { BottomNav } from "@/components/bottom-nav";
import { getRepository } from "@/lib/db/repository";
import { DEMO_BUSINESS_ID } from "@/lib/db/seed";
import { computeHealthScore } from "@/lib/domain/health";
import { computeBusinessMetrics } from "@/lib/domain/metrics";
import type { Business } from "@/lib/domain/types";
import { GrowView } from "./grow-view";

export const metadata = {
  title: "Stage 4: Second Fryer Affordability — GrowBox",
};

export default async function GrowPreviewPage() {
  const repo = getRepository();
  const rawBusiness = await repo.getBusiness(DEMO_BUSINESS_ID);
  const transactions = await repo.getTransactions(DEMO_BUSINESS_ID);
  const ingredients = await repo.getIngredients(DEMO_BUSINESS_ID);
  const products = await repo.getProducts(DEMO_BUSINESS_ID);

  const business: Business = rawBusiness ?? {
    id: DEMO_BUSINESS_ID,
    ownerId: "demo_owner",
    name: "Nomsa's Kitchen",
    stage: "stable",
    municipality: "City of Johannesburg",
    language: "en",
    monthlyBudgetCents: 150_000,
    onboarding: null,
    createdAt: "2026-09-01T00:00:00+02:00",
  };

  const metrics = computeBusinessMetrics(
    transactions,
    ingredients,
    products,
    business,
    "2026-10-24",
  );

  const health = computeHealthScore(metrics, 0.5);

  return (
    <div>
      <GrowView metrics={metrics} healthScore={health.score} />
      <BottomNav />
    </div>
  );
}
