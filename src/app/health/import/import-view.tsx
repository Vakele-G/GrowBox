"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Route } from "next";
import { importFnbStatementAction } from "@/app/actions/fnb";
import { Card, Pill, SectionTitle } from "@/components/ui";
import type { FnbStatementLine } from "@/lib/domain/fnb";

interface ImportViewProps {
  lines: FnbStatementLine[];
}

export function ImportView({ lines }: ImportViewProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    inserted: number;
    skipped: number;
    total: number;
  } | null>(null);

  const handleImport = () => {
    startTransition(async () => {
      const res = await importFnbStatementAction();
      setResult(res);
    });
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href={"/health" as Route}
          className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
        >
          ← Back to Health Score
        </Link>
        <Pill tone="amber">Simulated FNB feed</Pill>
      </div>

      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-ink">FNB Statement Import</h1>
        <p className="text-xs text-muted">
          Import statement-shaped lines through the same ledger pipeline as manual entries.
        </p>
      </header>

      {/* Demonstration notice */}
      <div className="rounded-xl border border-amber/30 bg-amber/10 p-3.5 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm">🏦</span>
          <p className="text-xs font-bold text-ink">Simulated FNB Banking Feed</p>
        </div>
        <p className="text-[11px] text-muted leading-relaxed">
          This is a demonstration feed for Nomsa&apos;s Kitchen. It is not connected to a live banking API. In production, these transaction lines would stream directly from the FNB Statements API and eWallet webhooks with user consent.
        </p>
      </div>

      {/* Result Alert if imported */}
      {result && (
        <div className="rounded-xl border border-leaf/40 bg-mint/30 p-4 space-y-1">
          <p className="text-xs font-bold text-forest">
            ✓ Ingestion Pipeline Completed
          </p>
          <p className="text-xs text-ink">
            Imported <strong>{result.inserted}</strong> new transactions. Skipped{" "}
            <strong>{result.skipped}</strong> existing lines with duplicate external IDs.
          </p>
          <div className="pt-2 flex gap-3 text-xs">
            <Link href={"/ledger" as Route} className="font-bold text-forest hover:underline">
              View in Ledger →
            </Link>
            <Link href={"/health" as Route} className="font-bold text-ink hover:underline">
              Check Updated Health Score →
            </Link>
          </div>
        </div>
      )}

      {/* Statement Feed List */}
      <Card className="p-4 space-y-3">
        <SectionTitle
          title="Statement Feed"
          action={
            <span className="text-xs text-muted font-medium">
              {lines.length} statement lines
            </span>
          }
        />

        <div className="divide-y divide-line">
          {lines.map((line) => {
            const isCredit = line.direction === "credit";
            return (
              <div key={line.reference} className="py-2.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{line.description}</span>
                    <span className="text-[10px] text-muted">({line.date})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted">
                    <span>Ref: {line.reference}</span>
                    <span>·</span>
                    <span>Bal: R{(line.balanceCents / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-bold ${
                      isCredit ? "text-forest" : "text-amber-800"
                    }`}
                  >
                    {isCredit ? "+" : "-"}R{(line.amountCents / 100).toFixed(2)}
                  </span>
                  <p className="text-[9px] uppercase font-bold text-muted">
                    {line.direction}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleImport}
            disabled={isPending}
            className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isPending ? "Importing Statement Lines..." : "Import All Lines into Ledger"}
          </button>
        </div>

        <p className="text-[10px] text-center text-muted">
          Deduplication guarantee: Repeating import is safe. Rows matching (business_id, external_id) will be skipped automatically.
        </p>
      </Card>
    </div>
  );
}
