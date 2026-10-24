import type { Language } from "@/lib/domain/types";
import { en, type Messages } from "./en";
import { zu } from "./zu";

const dictionaries: Record<Language, Messages> = { en, zu };

export function getMessages(lang: Language): Messages {
  return dictionaries[lang];
}

export function isLanguage(value: string | undefined): value is Language {
  return value === "en" || value === "zu";
}

export function fillTemplate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export type { Messages };
