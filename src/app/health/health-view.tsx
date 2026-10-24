"use client";

import Link from "next/link";
import type { Route } from "next";
import { Card, Pill, SectionTitle } from "@/components/ui";
import { BAND_LABELS, type HealthResult } from "@/lib/domain/health";
import type { Business, BusinessMetrics } from "@/lib/domain/types";

interface HealthViewProps {
  business: Business;
  metrics: BusinessMetrics;
  health: HealthResult;
}

export function HealthView({ business, metrics, health }: HealthViewProps) {
  const bandTones: Record<string, "green" | "lime" | "amber"> = {
    ready: "green",
    bankable: "green",
    emerging: "lime",
    building: "amber",
  };

  const currentTone = bandTones[health.band] ?? "amber";

  return (
    <div className="space-y-5 pb-12">
      {/* Screen Header */}
      <header className="space-y-1">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-leaf">GrowBox Credit Signal</p>
          <Pill tone={currentTone}>{BAND_LABELS[health.band]}</Pill>
        </div>
        <h1 className="text-2xl font-bold text-ink">Business Health Score</h1>
        <p className="text-xs text-muted">
          A deterministic credit-readiness signal built from {business.name}&apos;s verified paper trail.
        </p>
      </header>

      {/* Hero Score Card */}
      <Card className="p-6 text-center space-y-4 border-leaf/40 bg-gradient-to-b from-mint/20 to-paper">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-forest">Overall Health Score</p>
          <div className="flex items-baseline justify-center gap-1.5 mt-2">
            <span className="text-5xl font-black text-ink">{health.score}</span>
            <span className="text-base font-bold text-muted">/ 100</span>
          </div>
          <div className="mt-2 flex justify-center">
            <Pill tone={currentTone}>
              Band: {BAND_LABELS[health.band]} (
              {health.band === "ready"
                ? "80–100"
                : health.band === "bankable"
                ? "60–79"
                : health.band === "emerging"
                ? "40–59"
                : "0–39"}
              )
            </Pill>
          </div>
        </div>

        <p className="text-xs text-muted max-w-sm mx-auto leading-relaxed">
          {health.score >= 60
            ? "Your score qualifies you for the Bankable track! Consistent margin and daily trade logs prove financial discipline to banks."
            : "Building your score: Keep logging daily sales and maintain a 1-week cash cushion to unlock formal banking products."}
        </p>

        {/* Action CTAs */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Link
            href={"/health/record" as Route}
            className="btn-primary py-2.5 text-center text-xs font-bold flex items-center justify-center gap-1"
          >
            Credit Record →
          </Link>
          <Link
            href={"/health/import" as Route}
            className="btn-secondary py-2.5 text-center text-xs font-bold flex items-center justify-center gap-1"
          >
            FNB Import Feed →
          </Link>
        </div>
      </Card>

      {/* 6 Pillar Breakdown */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <SectionTitle title="Score Components" />
          <span className="text-[10px] text-muted font-semibold uppercase">6 Deterministic Pillars</span>
        </div>

        <div className="space-y-3.5">
          {/* 1. Profitability (Weight 25) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-ink">Profitability (4-week gross margin)</span>
              <span className="font-bold text-forest">{health.components.profitability} / 25 pts</span>
            </div>
            <div className="h-2 w-full rounded-full bg-sand overflow-hidden">
              <div
                className="h-full bg-leaf rounded-full transition-all duration-500"
                style={{ width: `${(health.components.profitability / 25) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-muted">
              4-week margin: {metrics.fourWeekMarginPct.toFixed(1)}% (Target: ≥40%)
            </p>
          </div>

          {/* 2. Cash Buffer / Runway (Weight 20) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-ink">Cash Buffer & Runway</span>
              <span className="font-bold text-forest">{health.components.cashBuffer} / 20 pts</span>
            </div>
            <div className="h-2 w-full rounded-full bg-sand overflow-hidden">
              <div
                className="h-full bg-leaf rounded-full transition-all duration-500"
                style={{ width: `${(health.components.cashBuffer / 20) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-muted">
              {metrics.savingsBufferWeeks.toFixed(1)} weeks operating buffer ({metrics.cashRunwayDays ?? "Healthy"} days runway)
            </p>
          </div>

          {/* 3. Record Consistency (Weight 20) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-ink">Record Consistency</span>
              <span className="font-bold text-forest">{health.components.recordConsistency} / 20 pts</span>
            </div>
            <div className="h-2 w-full rounded-full bg-sand overflow-hidden">
              <div
                className="h-full bg-leaf rounded-full transition-all duration-500"
                style={{ width: `${(health.components.recordConsistency / 20) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-muted">
              Logged transactions on {metrics.loggedDaysLast30} of the last 30 trading days
            </p>
          </div>

          {/* 4. Margin Stability (Weight 15) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-ink">Margin Stability</span>
              <span className="font-bold text-forest">{health.components.marginStability} / 15 pts</span>
            </div>
            <div className="h-2 w-full rounded-full bg-sand overflow-hidden">
              <div
                className="h-full bg-leaf rounded-full transition-all duration-500"
                style={{ width: `${(health.components.marginStability / 15) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-muted">
              Week-on-week margin change: {Math.abs(metrics.previousWeekMarginPct - metrics.weeklyMarginPct).toFixed(1)}%
            </p>
          </div>

          {/* 5. Savings Discipline (Weight 10) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-ink">Savings Discipline</span>
              <span className="font-bold text-forest">{health.components.savingsDiscipline} / 10 pts</span>
            </div>
            <div className="h-2 w-full rounded-full bg-sand overflow-hidden">
              <div
                className="h-full bg-leaf rounded-full transition-all duration-500"
                style={{ width: `${(health.components.savingsDiscipline / 10) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-muted">
              Cash cushion retained vs owner withdrawals
            </p>
          </div>

          {/* 6. Compliance Progress (Weight 10) */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-ink">Compliance Progress</span>
              <span className="font-bold text-forest">{health.components.complianceProgress} / 10 pts</span>
            </div>
            <div className="h-2 w-full rounded-full bg-sand overflow-hidden">
              <div
                className="h-full bg-leaf rounded-full transition-all duration-500"
                style={{ width: `${(health.components.complianceProgress / 10) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-muted">
              Food handling, municipal permits, and formal record keeping
            </p>
          </div>
        </div>
      </Card>

      {/* What Improves this Score */}
      <Card className="p-5 space-y-3">
        <SectionTitle title="What Improves This Score" />
        <ul className="space-y-2">
          {health.improvements.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-ink">
              <span className="text-leaf font-bold">✓</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Educational Disclaimer */}
      <div className="rounded-xl border border-line bg-paper/60 p-3.5 text-center">
        <p className="text-[11px] text-muted leading-relaxed">
          <strong>Important notice:</strong> This score is an educational credit-readiness signal designed for informal entrepreneurs. It does not constitute formal financial advice or a binding credit pre-approval.
        </p>
      </div>
    </div>
  );
}
