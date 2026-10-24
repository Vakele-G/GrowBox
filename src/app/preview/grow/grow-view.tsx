"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Card, Pill, SectionTitle } from "@/components/ui";
import {
  calculateEquipmentAffordability,
  SECOND_FRYER_OPTION,
} from "@/lib/domain/affordability";
import type { BusinessMetrics } from "@/lib/domain/types";

interface GrowViewProps {
  metrics: BusinessMetrics;
  healthScore: number;
}

export function GrowView({ metrics, healthScore }: GrowViewProps) {
  const [extraUnits, setExtraUnits] = useState(SECOND_FRYER_OPTION.extraUnitsPerDay);

  const customOption = {
    ...SECOND_FRYER_OPTION,
    extraUnitsPerDay: extraUnits,
  };

  const calc = calculateEquipmentAffordability(customOption, metrics.cashOnHandCents);

  return (
    <div className="space-y-4 pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href={"/" as Route}
          className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
        >
          ← Back to Home
        </Link>
        <Pill tone="green">Stage 4 Preview</Pill>
      </div>

      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Pill tone="amber">Preview - real calculations</Pill>
          <span className="text-xs text-muted">Scripted centrepiece</span>
        </div>
        <h1 className="text-2xl font-bold text-ink">Stage 4: Second Fryer Expansion</h1>
        <p className="text-xs text-muted">
          Your 30 days of consistent, profitable trading prove viable demand. Calculate if a second commercial gas fryer pays for itself.
        </p>
      </header>

      {/* Equipment Card */}
      <Card className="p-5 border-leaf/40 bg-gradient-to-b from-mint/20 to-paper space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest">
              Expansion Target
            </span>
            <h2 className="text-lg font-bold text-ink mt-0.5">{calc.equipmentName}</h2>
            <p className="text-xs text-muted">
              Capacity: 2x 10L oil pans · Doubles peak batch throughput from 30 to 65 units/batch
            </p>
          </div>
          <Pill tone={calc.isAffordable ? "green" : "amber"}>
            {calc.isAffordable ? "Affordable Now" : "Funding Required"}
          </Pill>
        </div>

        {/* Cost vs Cash on Hand Comparison */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-paper p-3 text-center border border-line">
          <div>
            <p className="text-[10px] uppercase font-bold text-muted">Equipment Cost</p>
            <p className="text-base font-black text-ink">
              R{(calc.costCents / 100).toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted">Cash on Hand</p>
            <p className="text-base font-bold text-forest">
              R{(calc.cashOnHandCents / 100).toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-muted">Shortfall</p>
            <p className={`text-base font-bold ${calc.shortfallCents > 0 ? "text-amber-800" : "text-forest"}`}>
              {calc.shortfallCents > 0 ? `R${(calc.shortfallCents / 100).toFixed(0)}` : "R0"}
            </p>
          </div>
        </div>

        {/* Real Payback Calculation */}
        <div className="rounded-xl border border-line p-3.5 bg-sand/30 space-y-3">
          <SectionTitle title="Real Payback & Profit Mathematics" />

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-line/60">
              <span className="text-muted">Unit Gross Margin ({customOption.productName})</span>
              <span className="font-bold text-ink">
                R{(calc.unitProfitCents / 100).toFixed(2)} / unit ({( (calc.unitProfitCents / customOption.sellingPriceCents) * 100 ).toFixed(1)}%)
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-line/60">
              <span className="text-muted">Extra Units Sold Per Day (Morning Peak)</span>
              <span className="font-bold text-forest">+{extraUnits} units/day</span>
            </div>

            <div className="flex justify-between py-1 border-b border-line/60">
              <span className="text-muted">Extra Gross Profit Per Trading Day</span>
              <span className="font-bold text-forest">
                R{(calc.extraProfitPerDayCents / 100).toFixed(2)} / day
              </span>
            </div>

            <div className="flex justify-between py-1 font-semibold text-ink">
              <span>Estimated Payback Period</span>
              <span className="font-black text-forest text-sm">
                {calc.paybackDays} trading days (~7 weeks)
              </span>
            </div>
          </div>

          {/* Interactive slider for extra units */}
          <div className="pt-2 space-y-1">
            <div className="flex justify-between text-[11px] text-muted">
              <span>Simulate Extra Peak Sales:</span>
              <span className="font-bold text-ink">{extraUnits} units/day</span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              step={5}
              value={extraUnits}
              onChange={(e) => setExtraUnits(Number(e.target.value))}
              className="w-full accent-forest cursor-pointer"
            />
          </div>
        </div>
      </Card>

      {/* FNB Credit Readiness Story */}
      <Card className="p-4 space-y-3 bg-paper">
        <div className="flex items-center justify-between">
          <SectionTitle title="How Nomsa Funds the Shortfall" />
          <Pill tone="green">Score: {healthScore}/100</Pill>
        </div>

        <p className="text-xs text-muted leading-relaxed">
          Because Nomsa maintained 28 logged trading days with a verified 56% gross margin, her GrowBox credit track record qualifies her for two actionable options:
        </p>

        <div className="space-y-2 text-xs">
          <div className="rounded-lg border border-line p-3 bg-sand/20 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink">Option 1: Retain 3 More Weeks of Cash</span>
              <Pill tone="lime">Self-Funded</Pill>
            </div>
            <p className="text-[11px] text-muted">
              At R650 weekly retained profit, Nomsa saves the remaining R1,950 in 3 weeks without borrowing.
            </p>
          </div>

          <div className="rounded-lg border border-forest/30 p-3 bg-mint/10 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink">Option 2: FNB Micro-Equipment Advance</span>
              <Pill tone="amber">Bankable Story</Pill>
            </div>
            <p className="text-[11px] text-muted">
              With a verified 66/100 Health Score, export your verified trading history pack to qualify for an FNB informal trader equipment advance.
            </p>
            <div className="pt-1">
              <Link href={"/health/record" as Route} className="text-xs font-bold text-forest hover:underline">
                View & Export Verified Credit Pack →
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
