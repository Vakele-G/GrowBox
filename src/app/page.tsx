import Link from "next/link";
import { redirect } from "next/navigation";
import type { Route } from "next";
import { BottomNav } from "@/components/bottom-nav";
import { HeroBand } from "@/components/hero-band";
import { LanguageSwitcher } from "@/components/language-switcher";
import { NextBestStepCard } from "@/components/next-best-step-card";
import { NudgeInbox } from "@/components/nudge-inbox";
import { PersonaSwitcher } from "@/components/persona-switcher";
import { StageTransitionBanner } from "@/components/stage-transition-banner";
import { Card, Pill, SectionTitle } from "@/components/ui";
import { getRepository } from "@/lib/db/repository";
import { DEMO_BUSINESS_ID } from "@/lib/db/seed";
import { computeBusinessMetrics } from "@/lib/domain/metrics";
import { determineNextBestStep, generateNudges } from "@/lib/domain/nudges";
import { detectStage } from "@/lib/domain/stage";
import type { Business, Language } from "@/lib/domain/types";

export default async function HomePage(props: {
  searchParams?: Promise<{ skip?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const repo = getRepository();
  const rawBusiness = await repo.getBusiness(DEMO_BUSINESS_ID);
  const stageProgress = await repo.getStageProgress(DEMO_BUSINESS_ID);
  const planItems = await repo.getPlanItems(DEMO_BUSINESS_ID);
  const products = await repo.getProducts(DEMO_BUSINESS_ID);
  const ingredients = await repo.getIngredients(DEMO_BUSINESS_ID);
  const transactions = await repo.getTransactions(DEMO_BUSINESS_ID);

  const business: Business = rawBusiness ?? {
    id: DEMO_BUSINESS_ID,
    ownerId: "demo_owner",
    name: "Nomsa's Kitchen",
    stage: "idea",
    municipality: "City of Johannesburg",
    language: "en",
    monthlyBudgetCents: 150_000,
    onboarding: null,
    createdAt: "2026-09-01T00:00:00+02:00",
  };

  // Fresh database: persist the fallback row so every write below it
  // (nudges, products, plan items, stage progress) has a businesses row
  // to reference instead of failing on a foreign key.
  if (!rawBusiness) {
    await repo.saveBusiness(business);
  }

  // If onboarding hasn't been completed yet, start user on the Stage 0/1 Onboarding Wizard
  if (!business.onboarding?.completed && searchParams?.skip !== "true") {
    redirect("/wizard");
  }

  const language: Language = business.language ?? "en";
  const costing = business.onboarding?.costing;

  // Compute metrics and stage progression
  const metrics = computeBusinessMetrics(transactions, ingredients, products, business, "2026-10-25");
  const stageInfo = detectStage(business, metrics, stageProgress);

  // Retrieve or initialize nudges
  const storedNudges = await repo.getNudges(DEMO_BUSINESS_ID);
  let activeNudges = storedNudges.filter((n) => n.status === "new" || n.status === "seen");

  if (storedNudges.length === 0) {
    const generated = generateNudges(business, metrics, stageInfo, "2026-10-25");
    await repo.saveNudges(generated);
    activeNudges = generated;
  }

  const nextBestStep = determineNextBestStep(stageInfo, activeNudges, metrics);
  const currentStage = stageProgress?.stage ?? business.stage ?? "idea";

  return (
    <div className="space-y-5 pb-6">
      {/* Header with App Identity, Stage, and Language Switcher */}
      <div className="motion-safe:animate-rise">
        <HeroBand
          eyebrow="GrowBox"
          title={business.name}
          subtitle={`${business.municipality} · Turning street hustle into a bankable business.`}
        />
      </div>
      <div className="-mt-2 flex items-center justify-end gap-2">
        <PersonaSwitcher currentStage={currentStage} />
        <LanguageSwitcher currentLanguage={language} />
      </div>

      {/* Stage Transition Announcement (when criteria are met) */}
      {stageInfo.readyToAdvance && stageInfo.nextStage && (
        <div className="motion-safe:animate-rise" style={{ animationDelay: "60ms" }}>
          <StageTransitionBanner
            currentStage={stageInfo.currentStage}
            nextStage={stageInfo.nextStage}
            criteria={stageInfo.criteria}
            language={language}
          />
        </div>
      )}

      {/* Hero: Next Best Step Card */}
      <div className="motion-safe:animate-rise" style={{ animationDelay: "120ms" }}>
        <NextBestStepCard step={nextBestStep} />
      </div>

      {/* Proactive Nudges & Alerts Inbox */}
      <div className="motion-safe:animate-rise" style={{ animationDelay: "180ms" }}>
        <NudgeInbox nudges={activeNudges} language={language} />
      </div>

      {/* Hero Feature Card: Stage 1 Wizard & Costing Calculator */}
      <Card className="card-lift p-5 border-accent/40 bg-mist/20 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-brand">
              Stage 1 Feature
            </p>
            <h2 className="text-lg font-bold text-ink">
              Costing & Launch Planning Wizard
            </h2>
          </div>
          <Pill tone="sky">Interactive</Pill>
        </div>

        <p className="text-xs text-muted leading-relaxed">
          Cost every ingredient from wholesale pack sizes, calculate batch yield and gross margin, and generate a verified launch plan.
        </p>

        {costing && (
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-mist/60 p-3 text-center border border-sky/50">
            <div>
              <p className="text-[10px] text-muted uppercase font-semibold">Unit Cost</p>
              <p className="text-sm font-bold text-brand">
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
              <p className="text-sm font-bold text-brand">
                {(costing.marginPct ?? 59.6).toFixed(1)}%
              </p>
            </div>
          </div>
        )}

        <div className="pt-1">
          <Link
            href={"/wizard" as Route}
            className="btn-primary w-full flex justify-center text-center font-bold text-xs py-2.5"
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
            action={<Pill tone="brand">{products.length} active</Pill>}
          />
          <div className="divide-y divide-line">
            {products.map((p) => (
              <div key={p.id} className="py-2 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-ink">{p.name}</p>
                  <p className="text-[10px] text-muted">
                    Batch yield: {p.batchYield} {p.unitLabel}s
                  </p>
                </div>
                <span className="font-bold text-brand">
                  R{(p.sellingPriceCents / 100).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Startup Checklist */}
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
                      item.status === "done" ? "bg-accent" : "bg-amber"
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

      {/* The 5-Stage Journey & Previews */}
      <Card className="p-4 space-y-3">
        <SectionTitle
          title="The 5-Stage Journey"
          action={<Pill tone="amber">Stage Previews</Pill>}
        />
        <p className="text-xs text-muted">
          GrowBox guides township entrepreneurs from business idea to bankable enterprise.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <Link
            href={"/preview/launch" as Route}
            className="card-lift rounded-xl border border-line p-2.5 bg-paper hover:bg-mist space-y-1 block"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink">Stage 2: Launch</span>
              <Pill tone="sky">Preview</Pill>
            </div>
            <p className="text-[10px] text-muted">
              Sourced municipal permit & food safety checklist.
            </p>
          </Link>

          <Link
            href={"/preview/grow" as Route}
            className="card-lift rounded-xl border border-line p-2.5 bg-paper hover:bg-mist space-y-1 block"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink">Stage 4: Grow</span>
              <Pill tone="brand">Real Maths</Pill>
            </div>
            <p className="text-[10px] text-muted">
              Second fryer affordability & payback mathematics.
            </p>
          </Link>

          <Link
            href={"/preview/enterprise" as Route}
            className="card-lift rounded-xl border border-line p-2.5 bg-paper hover:bg-mist space-y-1 block"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink">Stage 5: Enterprise</span>
              <Pill tone="amber">Pitch</Pill>
            </div>
            <p className="text-[10px] text-muted">
              Multi-outlet rollout & FNB SME commercial credit.
            </p>
          </Link>
        </div>
      </Card>

      <BottomNav />
    </div>
  );
}
