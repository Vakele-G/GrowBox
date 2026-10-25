"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState, useTransition } from "react";
import { advanceStageAction } from "@/app/actions/nudges";
import type { StageCriterion } from "@/lib/domain/stage";
import type { Language, Stage } from "@/lib/domain/types";
import { Pill } from "./ui";

interface StageTransitionBannerProps {
  currentStage: Stage;
  nextStage: Stage;
  criteria: StageCriterion[];
  language: Language;
}

export function StageTransitionBanner({
  currentStage,
  nextStage,
  criteria,
  language,
}: Readonly<StageTransitionBannerProps>) {
  const [isPending, startTransition] = useTransition();
  const [advanced, setAdvanced] = useState(false);

  const isZu = language === "zu";

  const handleAdvance = () => {
    startTransition(async () => {
      await advanceStageAction(nextStage);
      setAdvanced(true);
    });
  };

  if (advanced) {
    return (
      <div className="motion-safe:animate-pop rounded-2xl border border-accent bg-mist/30 p-4 text-center space-y-2">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-paper text-2xl ring-1 ring-sky/50" aria-hidden>🎉</span>
        <h3 className="text-base font-bold text-brand">
          {isZu
            ? "Siyakuhalalisela! Udlulele Esigabeni Sokukhula!"
            : "Congratulations! You've advanced to Stage 4 (Grow)!"}
        </h3>
        <p className="text-xs text-muted">
          {isZu
            ? "Ibhizinisi lakho selikulungele ukwandisa okokusebenza nokufinyelela izimali zebhange."
            : "Your business is now set up for equipment expansion and bankable credit readiness."}
        </p>
        <div className="pt-2">
          <Link
            href={"/preview/grow" as Route}
            className="btn-primary inline-flex py-2 px-4 text-xs font-bold"
          >
            {isZu
              ? "Hlola Ukuthengwa Kwesitofu Sesibili →"
              : "Explore Second Fryer Affordability →"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-sky/60 bg-gradient-to-br from-mist/50 via-paper to-sky/25 p-4.5 space-y-3.5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Pill tone="sky">Milestone Unlocked</Pill>
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand">
              {currentStage.toUpperCase()} → {nextStage.toUpperCase()}
            </span>
          </div>
          <h2 className="mt-1.5 text-lg font-extrabold text-ink">
            {isZu
              ? "Usukulungele Ukukhula! (Isigaba 3 → 4)"
              : "Ready to Grow! (Stage 3 → Stage 4)"}
          </h2>
        </div>
        <span className="motion-safe:animate-pop flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-paper text-2xl ring-1 ring-sky/60" aria-hidden>🚀</span>
      </div>

      <p className="text-xs text-muted leading-relaxed">
        {isZu
          ? "Irekhodi lakho lokuhweba lezinsuku ezingu-30 lifakazela inzuzo engaguquki. Uhlangabezane nazo zonke izidingo zokukhula."
          : "Your 30-day trading track record proves consistent profit and discipline. You have satisfied all criteria to expand."}
      </p>

      {/* Criteria checklist */}
      <div className="rounded-xl bg-paper/80 p-3 space-y-2 border border-line">
        {criteria.map((c) => (
          <div key={c.label} className="flex items-center gap-2 text-xs">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[10px] text-white font-bold">
              ✓
            </span>
            <span className="font-medium text-ink">{c.label}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={isPending}
        onClick={handleAdvance}
        className="btn-primary w-full py-2.5 text-center text-sm font-bold"
      >
        {isPending
          ? isZu
            ? "Iyaqhubeka..."
            : "Advancing Stage..."
          : isZu
            ? "Qhubekela Esigabeni Sokukhula (Stage 4) →"
            : "Advance to Stage 4: Grow →"}
      </button>
    </div>
  );
}
