import Link from "next/link";
import type { Route } from "next";
import type { NextBestStep } from "@/lib/domain/nudges";
import { Card, Pill } from "./ui";

interface NextBestStepCardProps {
  step: NextBestStep;
}

export function NextBestStepCard({ step }: Readonly<NextBestStepCardProps>) {
  const getBadgeTone = (badge: string) => {
    if (badge.includes("Action") || badge.includes("Urgent")) return "amber" as const;
    if (badge.includes("Stage") || badge.includes("Up")) return "sky" as const;
    if (badge.includes("Price")) return "red" as const;
    return "brand" as const;
  };

  return (
    <Card className="card-lift p-5 border-sky/40 bg-gradient-to-br from-paper via-mist/40 to-sky/20 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-brand">
              Next Best Step
            </span>
            <Pill tone={getBadgeTone(step.badge)}>{step.badge}</Pill>
          </div>
          <h2 className="text-lg font-extrabold text-ink leading-snug">
            {step.title}
          </h2>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-mist text-xl ring-1 ring-sky/50" aria-hidden>🎯</span>
      </div>

      <p className="text-xs text-muted leading-relaxed font-medium">
        {step.description}
      </p>

      <div className="pt-1">
        <Link
          href={step.actionHref as Route}
          className="btn-primary w-full flex items-center justify-center text-center font-bold py-2.5"
        >
          {step.actionLabel}
        </Link>
      </div>
    </Card>
  );
}
