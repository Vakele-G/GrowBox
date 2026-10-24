import Link from "next/link";
import type { Route } from "next";
import { BottomNav } from "@/components/bottom-nav";
import { Card, Pill, SectionTitle } from "@/components/ui";
import { getRepository } from "@/lib/db/repository";
import { DEMO_BUSINESS_ID } from "@/lib/db/seed";

export default async function HomePage() {
  const repo = getRepository();
  const business = await repo.getBusiness(DEMO_BUSINESS_ID);
  const stageProgress = await repo.getStageProgress(DEMO_BUSINESS_ID);
  const planItems = await repo.getPlanItems(DEMO_BUSINESS_ID);
  const products = await repo.getProducts(DEMO_BUSINESS_ID);

  const stage = stageProgress?.stage ?? business?.stage ?? "idea";
  const costing = business?.onboarding?.costing;

  return (
    <div className="space-y-5">
      <header>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-leaf">GrowBox</p>
          <Pill tone="green">Stage: {stage.toUpperCase()}</Pill>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-ink">
          {business?.name ?? "Nomsa's Kitchen"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {business?.municipality ?? "Soweto, Johannesburg"} · Turning hustle into a bankable business.
        </p>
      </header>

      {/* Hero Feature Card: Stage 1 Wizard & Costing Calculator */}
      <Card className="p-5 border-leaf/40 bg-mint/20 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-forest">
              Hero Feature · Stage 1
            </p>
            <h2 className="text-lg font-bold text-ink">
              Costing & Launch Planning Wizard
            </h2>
          </div>
          <Pill tone="lime">Interactive</Pill>
        </div>

        <p className="text-sm text-muted">
          Cost every ingredient from wholesale pack sizes, calculate batch yield and gross margin, and generate a verified launch plan.
        </p>

        {costing && (
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-paper p-3 text-center border border-line">
            <div>
              <p className="text-[10px] text-muted uppercase font-semibold">Unit Cost</p>
              <p className="text-sm font-bold text-forest">
                R{((costing.costPerUnitCents ?? 202) / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase font-semibold">Selling Price</p>
              <p className="text-sm font-bold text-ink">
                R{((costing.suggestedPriceCents ?? 500) / 100).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted uppercase font-semibold">Gross Margin</p>
              <p className="text-sm font-bold text-forest">
                {(costing.marginPct ?? 59.6).toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        <div className="pt-1">
          <Link
            href={"/wizard" as Route}
            className="btn-primary w-full flex justify-center text-center font-semibold"
          >
            {costing ? "Re-calculate or Update Launch Plan →" : "Start Costing & Launch Wizard →"}
          </Link>
        </div>
      </Card>

      {/* Active Products & Recipes */}
      {products.length > 0 && (
        <Card className="p-4 space-y-3">
          <SectionTitle
            title="Products & Menu"
            action={<Pill tone="green">{products.length} active</Pill>}
          />
          <div className="divide-y divide-line">
            {products.map((p) => (
              <div key={p.id} className="py-2 flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="text-xs text-muted">Batch yield: {p.batchYield} {p.unitLabel}s</p>
                </div>
                <span className="font-bold text-forest">
                  R{(p.sellingPriceCents / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Launch Plan Items */}
      {planItems.length > 0 && (
        <Card className="p-4 space-y-3">
          <SectionTitle
            title="Startup Checklist"
            action={
              <span className="text-xs text-muted">
                {planItems.filter((i) => i.status === "done").length}/{planItems.length} done
              </span>
            }
          />
          <div className="space-y-2">
            {planItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs rounded-lg border border-line p-2.5 bg-paper"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      item.status === "done" ? "bg-leaf" : "bg-amber"
                    }`}
                  />
                  <span className={item.status === "done" ? "line-through text-muted" : "font-medium text-ink"}>
                    {item.label}
                  </span>
                </div>
                {item.estCostCents > 0 && (
                  <span className="text-muted font-medium">
                    R{(item.estCostCents / 100).toFixed(0)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <BottomNav />
    </div>
  );
}
