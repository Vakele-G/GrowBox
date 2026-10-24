"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { resetDemoPersonaAction } from "@/app/actions/demo";
import type { Stage } from "@/lib/domain/types";

interface PersonaSwitcherProps {
  currentStage: Stage;
}

export function PersonaSwitcher({ currentStage }: PersonaSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isStage1 = currentStage === "idea";

  const handleToggle = () => {
    startTransition(async () => {
      await resetDemoPersonaAction(isStage1 ? "full" : "minimal");
      if (isStage1) {
        router.push("/" as Route);
      } else {
        router.push("/wizard" as Route);
      }
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      title={isStage1 ? "Switch to Stage 3 (Established with 14d trade history)" : "Reset to Stage 1 (Fresh startup idea with wizard)"}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink shadow-2xs hover:bg-sand/40 disabled:opacity-50 transition-colors"
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isStage1 ? "bg-amber" : "bg-leaf"}`} />
      <span>
        {isPending
          ? "Switching..."
          : isStage1
          ? "Mode: Stage 1 (Idea) ⇄"
          : "Mode: Stage 3 (Stable) ⇄"}
      </span>
    </button>
  );
}
