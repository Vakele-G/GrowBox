"use client";

import { useState } from "react";
import { Card, Pill, SectionTitle } from "@/components/ui";
import { formatDateZA } from "@/lib/domain/dates";
import type { WarningTrigger } from "@/lib/domain/metrics";
import type { BusinessMetrics, DailyTotal } from "@/lib/domain/types";

interface DashboardViewProps {
  metrics: BusinessMetrics;
  warnings: WarningTrigger[];
  dailyTotals: DailyTotal[];
  businessName: string;
  initialSeparatedMoney: boolean;
}

export function DashboardView({
  metrics,
  warnings,
  dailyTotals,
  businessName,
  initialSeparatedMoney,
}: DashboardViewProps) {
  const [trendDays, setTrendDays] = useState<14 | 30>(14);
  const [separatedMoney, setSeparatedMoney] = useState(initialSeparatedMoney);
  const [separatedMessage, setSeparatedMessage] = useState<string | null>(null);

  const displayedTotals = dailyTotals.slice(0, trendDays);
  const maxDaySales = Math.max(...displayedTotals.map((d) => d.salesCents), 10_000);

  function handleToggleSeparation() {
    setSeparatedMoney((prev) => !prev);
    setSeparatedMessage(
      !separatedMoney
        ? "✓ Great discipline! Keeping business and personal funds separate is a key requirement for FNB credit readiness."
        : "Money mixed. Consider opening an eWallet or FNB Business account.",
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wide text-leaf">Stage 3: Stable</p>
          <Pill tone="green">Healthy Growth</Pill>
        </div>
        <h1 className="mt-1 text-2xl font-bold text-ink">{businessName}</h1>
        <p className="mt-1 text-sm text-muted">
          Financial dashboard, cash runway forecast, and proactive early warnings.
        </p>
      </header>

      {/* Active Warnings & Proactive Alerts */}
      {warnings.length > 0 && (
        <div className="space-y-2.5">
          {warnings.map((w) => (
            <div
              key={w.key}
              className={`rounded-2xl border p-4 space-y-1.5 ${
                w.severity === "critical"
                  ? "border-danger/30 bg-danger-soft/60"
                  : w.severity === "warning"
                    ? "border-amber/30 bg-amber-soft/60"
                    : "border-leaf/30 bg-mint/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold uppercase tracking-wide ${
                    w.severity === "critical"
                      ? "text-danger"
                      : w.severity === "warning"
                        ? "text-amber"
                        : "text-forest"
                  }`}
                >
                  {w.title}
                </span>
                <Pill tone={w.severity === "critical" ? "red" : w.severity === "warning" ? "amber" : "green"}>
                  {w.severity.toUpperCase()}
                </Pill>
              </div>

              <p className="text-xs font-medium text-ink leading-relaxed">{w.messageEn}</p>
              <p className="text-[11px] text-muted italic">{w.messageZu}</p>

              <div className="rounded-lg bg-paper/80 p-2 text-[10px] text-muted border border-line">
                <span className="font-semibold text-ink">Calculation: </span>
                {w.calculationExplanation}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <Card className="p-3.5 space-y-1">
          <p className="text-[10px] font-bold text-muted uppercase">Cash on Hand</p>
          <p className="text-xl font-bold text-forest">
            R{(metrics.cashOnHandCents / 100).toFixed(0)}
          </p>
          <p className="text-[10px] text-muted">Net after stock & owner draws</p>
        </Card>

        <Card className="p-3.5 space-y-1">
          <p className="text-[10px] font-bold text-muted uppercase">Cash Runway</p>
          <p
            className={`text-xl font-bold ${
              (metrics.cashRunwayDays ?? 0) <= 3 ? "text-amber" : "text-forest"
            }`}
          >
            {metrics.cashRunwayDays !== null ? `${metrics.cashRunwayDays} days` : "N/A"}
          </p>
          <p className="text-[10px] text-muted">
            At R{(metrics.averageDailyExpenseCents / 100).toFixed(0)}/day expense
          </p>
        </Card>

        <Card className="p-3.5 space-y-1">
          <p className="text-[10px] font-bold text-muted uppercase">4-Week Margin</p>
          <p
            className={`text-xl font-bold ${
              metrics.fourWeekMarginPct >= 50 ? "text-forest" : "text-amber"
            }`}
          >
            {metrics.fourWeekMarginPct.toFixed(1)}%
          </p>
          <p className="text-[10px] text-muted">
            Last 7d: {metrics.weeklyMarginPct.toFixed(0)}% (was {metrics.previousWeekMarginPct.toFixed(0)}%)
          </p>
        </Card>

        <Card className="p-3.5 space-y-1">
          <p className="text-[10px] font-bold text-muted uppercase">Savings Buffer</p>
          <p
            className={`text-xl font-bold ${
              metrics.savingsBufferWeeks >= 1 ? "text-forest" : "text-amber"
            }`}
          >
            {metrics.savingsBufferWeeks}x weeks
          </p>
          <p className="text-[10px] text-muted">Target: ≥ 1.0x week buffer</p>
        </Card>
      </div>

      {/* Profit & Cash-Flow Trend */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <SectionTitle title="Sales & Cash Flow Trend" />
          <div className="flex rounded-lg border border-line bg-cream p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTrendDays(14)}
              className={`rounded px-2 py-0.5 ${
                trendDays === 14 ? "bg-forest text-white" : "text-muted"
              }`}
            >
              14 Days
            </button>
            <button
              type="button"
              onClick={() => setTrendDays(30)}
              className={`rounded px-2 py-0.5 ${
                trendDays === 30 ? "bg-forest text-white" : "text-muted"
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        <p className="text-xs text-muted">
          Daily sales takings vs operating stock expenses over the last {trendDays} trading days.
        </p>

        {/* Visual Bar Chart */}
        <div className="space-y-2 pt-1">
          {displayedTotals.slice(0, 10).map((day) => {
            const salesWidth = Math.min(100, (day.salesCents / maxDaySales) * 100);
            const expWidth = Math.min(100, (day.expensesCents / maxDaySales) * 100);

            return (
              <div key={day.date} className="space-y-1 text-xs">
                <div className="flex justify-between text-[11px] text-muted">
                  <span className="font-semibold text-ink">{formatDateZA(day.date)}</span>
                  <span>
                    <strong className="text-forest">+R{(day.salesCents / 100).toFixed(0)}</strong> /{" "}
                    <strong className="text-danger">-R{(day.expensesCents / 100).toFixed(0)}</strong>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-cream overflow-hidden flex gap-0.5">
                  <div
                    className="h-full rounded-full bg-leaf"
                    style={{ width: `${salesWidth}%` }}
                    title={`Sales: R${(day.salesCents / 100).toFixed(0)}`}
                  />
                  <div
                    className="h-full rounded-full bg-danger/80"
                    style={{ width: `${expWidth}%` }}
                    title={`Expenses: R${(day.expensesCents / 100).toFixed(0)}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Stock Cover Guidance */}
      <Card className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <SectionTitle title="Stock & Ingredients Guidance" />
          <Pill tone={(metrics.stockDaysCover ?? 0) >= 2 ? "green" : "amber"}>
            {metrics.stockDaysCover ?? 0} days cover
          </Pill>
        </div>
        <p className="text-xs text-muted">
          Based on current daily sales volume, your stock covers about{" "}
          <strong className="text-ink">{metrics.stockDaysCover ?? 0} days of trade</strong>.
          Next regular restock estimated cost:{" "}
          <strong className="text-forest">R{(metrics.nextRestockCostCents / 100).toFixed(0)}</strong>.
        </p>
      </Card>

      {/* Personal vs Business Money Separation Prompt */}
      <Card className="p-4 border-leaf/30 bg-mint/20 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-forest">Financial Discipline</p>
            <h3 className="text-sm font-bold text-ink">
              Separating Business & Personal Cash
            </h3>
          </div>
          <Pill tone={separatedMoney ? "green" : "amber"}>
            {separatedMoney ? "Separated" : "Mixed Funds"}
          </Pill>
        </div>

        <p className="text-xs text-muted leading-relaxed">
          Mixing stall money with household groceries is the #1 reason informal businesses run out of restock cash mid-week. Pay yourself a fixed owner wage instead of taking ad-hoc cash from the tin.
        </p>

        {separatedMessage && (
          <p className="text-xs font-semibold text-forest bg-paper p-2 rounded-lg border border-line">
            {separatedMessage}
          </p>
        )}

        <button
          type="button"
          onClick={handleToggleSeparation}
          className="btn-secondary w-full text-xs font-bold py-2.5"
        >
          {separatedMoney
            ? "✓ Funds Separated (Tap to Change)"
            : "I commit to separating my business money →"}
        </button>
      </Card>
    </div>
  );
}
