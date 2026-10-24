"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Card, Pill } from "@/components/ui";
import type { KnowledgeChunk } from "@/lib/domain/types";

interface LaunchViewProps {
  knowledgeChunks: KnowledgeChunk[];
}

export function LaunchView({ knowledgeChunks }: LaunchViewProps) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({
    kc_trading_permit: true,
    kc_recordkeeping: true,
  });

  const toggleTask = (id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalCount = knowledgeChunks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
        <Pill tone="lime">Stage 2 Preview</Pill>
      </div>

      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Pill tone="amber">Preview - not fully built</Pill>
          <span className="text-xs text-muted">Sourced & dated compliance</span>
        </div>
        <h1 className="text-2xl font-bold text-ink">Stage 2: Launch Checklist</h1>
        <p className="text-xs text-muted">
          The essential legal, food-handling, and municipal tasks every township food entrepreneur must complete before or during early trading.
        </p>
      </header>

      {/* Progress Card */}
      <Card className="p-4 space-y-2 bg-mint/20 border-leaf/30">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-ink">Checklist Progress</span>
          <span className="font-bold text-forest">
            {completedCount} of {totalCount} completed ({progressPct}%)
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-sand overflow-hidden">
          <div
            className="h-full bg-leaf rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-[10px] text-muted">
          Completing launch compliance tasks directly increases your Business Health Score by up to 10 points.
        </p>
      </Card>

      {/* Sourced Compliance Tasks */}
      <div className="space-y-3">
        {knowledgeChunks.map((kc) => {
          const isDone = Boolean(completed[kc.id]);
          return (
            <Card key={kc.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => toggleTask(kc.id)}
                    className={`mt-0.5 h-5 w-5 rounded border flex items-center justify-center text-xs font-bold transition-colors ${
                      isDone
                        ? "bg-forest border-forest text-paper"
                        : "border-line bg-paper text-transparent hover:border-forest"
                    }`}
                  >
                    ✓
                  </button>
                  <div>
                    <h2
                      className={`text-sm font-bold ${
                        isDone ? "line-through text-muted" : "text-ink"
                      }`}
                    >
                      {kc.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-semibold text-forest uppercase">
                        {kc.topic}
                      </span>
                      <span className="text-[10px] text-muted">·</span>
                      <span className="text-[10px] text-muted">{kc.jurisdiction}</span>
                    </div>
                  </div>
                </div>

                <Pill tone={isDone ? "green" : "amber"}>
                  {isDone ? "Completed" : "Action Needed"}
                </Pill>
              </div>

              {/* Requirement Text */}
              <p className="text-xs text-muted leading-relaxed pl-7">
                {kc.requirement}
              </p>

              {/* Verification & Authority Source Footnote */}
              <div className="pl-7 pt-1 border-t border-line/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted">
                <div className="flex items-center gap-2">
                  <span>Source:</span>
                  <a
                    href={kc.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-forest underline hover:text-ink truncate max-w-[180px]"
                  >
                    {kc.sourceUrl.replace("https://www.", "").replace("https://", "")}
                  </a>
                  <span>·</span>
                  <span>Verified: {kc.lastVerified}</span>
                </div>
                <span className="italic font-medium text-amber-900">
                  Verify with your municipality
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Bottom Municipal Disclaimer */}
      <div className="rounded-xl border border-line bg-paper/60 p-3.5 text-center text-[10px] text-muted leading-relaxed">
        <strong>Municipal Disclaimer:</strong> Compliance bylaws vary across the City of Johannesburg, Ekurhuleni, and other South African municipalities. Always verify trading requirements with your local regional customer centre before signing contracts or paying fees.
      </div>
    </div>
  );
}
