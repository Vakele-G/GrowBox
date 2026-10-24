import { z } from "zod";
import type { Language, ParsedEntry, Product } from "@/lib/domain/types";
import type { NudgeRuleKey } from "@/lib/domain/nudges";
import { parseLogFallback } from "./parser";
import { callGemini, geminiConfigured } from "./gemini";
import { templateExplain, templateNudge } from "./templates";

const parsedEntrySchema = z.object({
  type: z.enum(["sale", "expense"]),
  category: z.string().min(1).max(40),
  amountCents: z.number().int().positive().max(100_000_000),
  description: z.string().min(1).max(120),
  quantity: z.number().int().positive().max(100_000).nullable().optional(),
  productId: z.string().min(1).nullable().optional(),
  confidence: z.number().min(0).max(1),
});

const parseResponseSchema = z.object({
  entries: z.array(parsedEntrySchema).max(12),
});

export interface ParseResult {
  entries: ParsedEntry[];
  provider: "gemini" | "fallback";
}

export async function parseLog(
  text: string,
  ctx: { products: Product[] },
): Promise<ParseResult> {
  const fallback = parseLogFallback(text, ctx.products);
  if (!geminiConfigured() || !text.trim()) {
    return { entries: fallback, provider: "fallback" };
  }

  const productList = ctx.products
    .map((product) => `${product.id} = ${product.name} (R${product.sellingPriceCents / 100})`)
    .join("\n");

  const result = await callGemini(
    `Parse this South African informal trader note into ledger entries.

Products (use the exact id):
${productList || "none"}

Note: "${text}"

Return JSON: {"entries":[{"type":"sale"|"expense","category":"sales"|"stock"|"transport"|"utilities"|"other","amountCents":integer cents,"description":"short label","quantity":integer|null,"productId":"exact id or null","confidence":0..1}]}
Money is South African rand. Never invent an amount that is not stated or derivable from quantity times the product price.`,
    {
      system:
        "You extract bookkeeping entries for a township food business. Return JSON only. Amounts are integer cents. Prefer the given product ids.",
    },
  );

  if (!result.ok || !result.text) {
    return { entries: fallback, provider: "fallback" };
  }

  try {
    const parsed = parseResponseSchema.safeParse(JSON.parse(result.text));
    if (!parsed.success || parsed.data.entries.length === 0) {
      return { entries: fallback, provider: "fallback" };
    }
    const validProductIds = new Set(ctx.products.map((product) => product.id));
    const entries: ParsedEntry[] = parsed.data.entries.map((entry) => ({
      type: entry.type,
      category: entry.category,
      amountCents: entry.amountCents,
      description: entry.description,
      quantity: entry.quantity ?? null,
      productId:
        entry.productId && validProductIds.has(entry.productId) ? entry.productId : null,
      confidence: entry.confidence,
    }));
    return { entries, provider: "gemini" };
  } catch {
    return { entries: fallback, provider: "fallback" };
  }
}

const messageSchema = z.object({ message: z.string().min(1).max(600) });

export async function phraseNudge(
  ruleKey: NudgeRuleKey,
  payload: Record<string, string | number | boolean | null>,
  lang: Language,
): Promise<string> {
  const fallback = templateNudge(ruleKey, payload, lang);
  if (!geminiConfigured()) return fallback;

  const language = lang === "zu" ? "isiZulu" : "South African English";
  const result = await callGemini(
    `Rewrite this business alert in ${language}. Keep every number and currency amount exactly the same. Be warm, plain and specific. Maximum 55 words.

Rule: ${ruleKey}
Data: ${JSON.stringify(payload)}
Draft: ${fallback}

Return JSON: {"message":"..."}`,
    {
      system:
        "You phrase alerts for an informal trader. You never calculate or change numbers. Return JSON only.",
    },
  );
  if (!result.ok || !result.text) return fallback;
  try {
    const parsed = messageSchema.safeParse(JSON.parse(result.text));
    return parsed.success ? parsed.data.message : fallback;
  } catch {
    return fallback;
  }
}

export async function explain(
  metric: string,
  payload: Record<string, string | number | boolean | null>,
  lang: Language,
): Promise<string> {
  const fallback = templateExplain(metric, payload, lang);
  if (!geminiConfigured()) return fallback;

  const result = await callGemini(
    `Explain in ${lang === "zu" ? "isiZulu" : "plain South African English"} how GrowBox calculated this metric. Use the exact numbers. Maximum 45 words. Return JSON: {"message":"..."}

Metric: ${metric}
Data: ${JSON.stringify(payload)}
Deterministic explanation: ${fallback}`,
    { system: "You explain a deterministic calculation. Never change a number. JSON only." },
  );
  if (!result.ok || !result.text) return fallback;
  try {
    const parsed = messageSchema.safeParse(JSON.parse(result.text));
    return parsed.success ? parsed.data.message : fallback;
  } catch {
    return fallback;
  }
}

export async function translate(text: string, lang: Language): Promise<string> {
  if (!geminiConfigured()) return text;
  const result = await callGemini(
    `Translate this app string into ${lang === "zu" ? "isiZulu" : "South African English"}. Keep numbers and currency. Return JSON: {"message":"..."}\n\n${text}`,
    { system: "You translate short UI strings. Return JSON only." },
  );
  if (!result.ok || !result.text) return text;
  try {
    const parsed = messageSchema.safeParse(JSON.parse(result.text));
    return parsed.success ? parsed.data.message : text;
  } catch {
    return text;
  }
}
