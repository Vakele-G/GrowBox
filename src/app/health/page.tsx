import { BottomNav } from "@/components/bottom-nav";
import { getRepository } from "@/lib/db/repository";
import { DEMO_BUSINESS_ID } from "@/lib/db/seed";
import { computeHealthScore } from "@/lib/domain/health";
import { computeBusinessMetrics } from "@/lib/domain/metrics";
import type { Business } from "@/lib/domain/types";
import { HealthView } from "./health-view";

export const metadata = {
  title: "Business Health Score — GrowBox",
};

export default async function HealthPage() {
  const repo = getRepository();
  const rawBusiness = await repo.getBusiness(DEMO_BUSINESS_ID);
  const transactions = await repo.getTransactions(DEMO_BUSINESS_ID);
  const ingredients = await repo.getIngredients(DEMO_BUSINESS_ID);
  const products = await repo.getProducts(DEMO_BUSINESS_ID);
  const planItems = await repo.getPlanItems(DEMO_BUSINESS_ID);

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

  const taskItems = planItems.filter((i) => i.kind === "task");
  const complianceProgress = taskItems.length > 0
    ? taskItems.filter((i) => i.status === "done").length / taskItems.length
    : 0.5;

  const health = computeHealthScore(metrics, complianceProgress);

  // Persist health score snapshot
  await repo.saveHealthScore({
    id: `health_${DEMO_BUSINESS_ID}_latest`,
    businessId: DEMO_BUSINESS_ID,
    score: health.score,
    components: health.components,
    band: health.band,
    computedAt: "2026-10-24T12:00:00+02:00",
  });

  return (
    <div>
      <HealthView business={business} metrics={metrics} health={health} />
      <BottomNav />
    </div>
  );
}
