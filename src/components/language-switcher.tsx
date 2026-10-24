"use client";

import { useTransition } from "react";
import { toggleLanguageAction } from "@/app/actions/nudges";
import type { Language } from "@/lib/domain/types";

interface LanguageSwitcherProps {
  currentLanguage: Language;
}

export function LanguageSwitcher({ currentLanguage }: Readonly<LanguageSwitcherProps>) {
  const [isPending, startTransition] = useTransition();

  const handleToggle = (lang: Language) => {
    if (lang === currentLanguage || isPending) return;
    startTransition(async () => {
      await toggleLanguageAction(lang);
    });
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-line bg-surface p-0.5 text-xs font-semibold">
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleToggle("en")}
        className={`rounded px-2 py-0.5 transition-colors ${
          currentLanguage === "en"
            ? "bg-forest text-white"
            : "text-muted hover:text-ink"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => handleToggle("zu")}
        className={`rounded px-2 py-0.5 transition-colors ${
          currentLanguage === "zu"
            ? "bg-forest text-white"
            : "text-muted hover:text-ink"
        }`}
      >
        ZU
      </button>
    </div>
  );
}
