"use client";

import { useState, useTransition } from "react";
import { updateNudgeStatusAction } from "@/app/actions/nudges";
import type { Language, Nudge, NudgeSeverity, NudgeStatus } from "@/lib/domain/types";
import { Card, Pill, SectionTitle } from "./ui";

interface NudgeInboxProps {
  nudges: Nudge[];
  language: Language;
}

export function NudgeInbox({ nudges, language }: Readonly<NudgeInboxProps>) {
  const [activeNudges, setActiveNudges] = useState<Nudge[]>(nudges);
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = (id: string, status: NudgeStatus) => {
    // Optimistic removal
    setActiveNudges((prev) => prev.filter((n) => n.id !== id));
    startTransition(async () => {
      await updateNudgeStatusAction(id, status);
    });
  };

  const getSeverityPill = (severity: NudgeSeverity) => {
    switch (severity) {
      case "critical":
        return <Pill tone="red">Urgent Action</Pill>;
      case "warning":
        return <Pill tone="amber">Attention</Pill>;
      case "info":
      default:
        return <Pill tone="brand">Insight</Pill>;
    }
  };

  const isZu = language === "zu";

  return (
    <Card className="p-4 space-y-3">
      <SectionTitle
        title={isZu ? "Imiyalezo Nezaziso Zebhizinisi" : "Proactive Alerts & Insights"}
        action={
          activeNudges.length > 0 ? (
            <Pill tone="amber">{activeNudges.length} active</Pill>
          ) : (
            <Pill tone="brand">All clear</Pill>
          )
        }
      />

      {activeNudges.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-paper/50 p-4 text-center">
          <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-mist text-lg" aria-hidden>
            ✅
          </span>
          <p className="text-xs text-muted">
            {isZu
              ? "Konke kuhlelekile! Azikho izaziso ezintsha okwamanje."
              : "All caught up! No active alerts right now."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeNudges.map((nudge) => {
            const message = isZu ? nudge.messageZu : nudge.messageEn;
            const borderTone =
              nudge.severity === "critical"
                ? "border-danger/30 bg-danger/5"
                : nudge.severity === "warning"
                  ? "border-amber/30 bg-amber/5"
                  : "border-accent/30 bg-mist/10";

            return (
              <div
                key={nudge.id}
                className={`rounded-xl border p-3.5 space-y-2.5 transition-all ${borderTone}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getSeverityPill(nudge.severity)}
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted">
                      {nudge.ruleKey.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-ink font-medium">
                  {message}
                </p>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-line/60">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleUpdateStatus(nudge.id, "dismissed")}
                    className="rounded-lg px-2.5 py-1 text-xs text-muted hover:text-ink hover:bg-mist font-semibold transition-colors"
                  >
                    {isZu ? "Susa" : "Dismiss"}
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleUpdateStatus(nudge.id, "done")}
                    className="rounded-lg bg-brand text-white px-3 py-1 text-xs font-bold hover:bg-brand/90 transition-all shadow-sm active:scale-95"
                  >
                    {isZu ? "Kwenziwe ✓" : "Mark Done ✓"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
