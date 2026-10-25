import Link from "next/link";
import type { Route } from "next";
import { BottomNav } from "@/components/bottom-nav";
import { HeroBand } from "@/components/hero-band";
import { Card, Pill, SectionTitle } from "@/components/ui";

export const metadata = {
  title: "Stage 5: Enterprise Preview — GrowBox",
};

export default function EnterprisePreviewPage() {
  return (
    <div className="space-y-4 pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href={"/" as Route}
          className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
        >
          ← Back to Home
        </Link>
        <Pill tone="amber">Stage 5 Preview</Pill>
      </div>

      <div className="motion-safe:animate-rise">
        <HeroBand
          eyebrow="GrowBox Stage Preview"
          title="Stage 5: Enterprise & Expansion"
          subtitle="The end state — from a street-side amagwinya stall to an established, formalised, multi-outlet township food brand."
          action={<Pill tone="amber">Preview - pitch only</Pill>}
        />
      </div>

      {/* Hero Vision Card */}
      <Card className="card-lift p-5 border-sky/50 bg-gradient-to-b from-mist/40 to-paper space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-brand">The GrowBox Promise</p>
          <Pill tone="brand">Bankable & Growing</Pill>
        </div>
        <h2 className="text-lg font-bold text-ink">
          &ldquo;We turn a street hustle into a bankable business by building the financial track record banks need.&rdquo;
        </h2>
        <p className="text-xs text-muted leading-relaxed">
          At Stage 5, the entrepreneur graduates from manual cash-flow logging into formal digital business accounts, bulk supply contracts, and commercial credit lines.
        </p>
      </Card>

      {/* 4 Enterprise Pillars */}
      <div className="space-y-3">
        {/* 1. Legal Formalisation */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <SectionTitle title="1. Legal & Regulatory Formalisation" />
            <Pill tone="sky">CIPC & SARS</Pill>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Registered (Pty) Ltd company structure, SARS Tax Clearance PIN, and municipal food premises certificates, prepared directly from the business&apos;s verified paper trail.
          </p>
        </Card>

        {/* 2. Multi-Outlet Rollout */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <SectionTitle title="2. Multi-Outlet Rollout & Job Creation" />
            <Pill tone="sky">Employment</Pill>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Expanding from Nomsa&apos;s original stall to 3 branded township hubs (Orlando East, Bara Taxi Rank, and Meadowlands). Employment contracts, UIF registration, and standardized recipe manuals.
          </p>
        </Card>

        {/* 3. Direct Wholesale Procurement */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <SectionTitle title="3. Wholesale Supply Terms" />
            <Pill tone="sky">Procurement</Pill>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Transitioning from retail grocery packs to pallet-tier pricing directly from millers and oil refineries (e.g. 200kg flour sacks and 200L oil drums), improving gross margins by an additional 12–15%.
          </p>
        </Card>

        {/* 4. FNB Commercial SME Facilities */}
        <Card className="p-4 space-y-2 bg-paper border-brand/30">
          <div className="flex items-center justify-between">
            <SectionTitle title="4. FNB Commercial SME Relationship" />
            <Pill tone="brand">FNB Integration</Pill>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            Graduation to an FNB Gold Business Account with Speedpoint fleet, automated eWallet payroll for staff, and asset-backed vehicle finance for mobile food distribution.
          </p>
        </Card>
      </div>

      <div className="rounded-xl border border-line bg-paper/60 p-3.5 text-center text-[10px] text-muted">
        This screen represents the long-term roadmap and pitch vision submitted for the FNB App of the Year Hackathon 2026.
      </div>

      <BottomNav />
    </div>
  );
}
