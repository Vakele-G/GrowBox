import { z } from "zod";
import type { ParsedEntry } from "@/lib/domain/types";
import { parseLogFallback } from "./fallback";
import type { ParseContext } from "./types";

export const ParsedEntrySchema = z.object({
  type: z.enum(["sale", "expense"]),
  category: z.string(),
  amountCents: z.number().int().positive(),
  description: z.string(),
  productId: z.string().nullable().default(null),
  quantity: z.number().nullable().default(null),
  confidence: z.number().min(0).max(1).default(0.9),
});

export const ParsedEntriesArraySchema = z.array(ParsedEntrySchema);

const GEMINI_TIMEOUT_MS = 8000;

/**
 * Natural language transaction parser.
 * Always attempts AI parsing with an 8-second timeout, falling back
 * safely to the deterministic regex parser on timeout, network error,
 * missing API key, or invalid schema.
 */
export async function parseLog(
  text: string,
  ctx?: ParseContext,
): Promise<ParsedEntry[]> {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const apiKey = process.env.GEMINI_API_KEY ?? "";
  const isKeyAvailable =
    apiKey && !apiKey.includes("your-") && apiKey.length > 10;

  if (!isKeyAvailable) {
    return parseLogFallback(trimmed, ctx);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    const prompt = `You are a financial record assistant for a South African informal township business (Nomsa's Kitchen).
Parse this daily log input into structured sales and expense entries:
Input: "${trimmed}"

Known products:
- Amagwinya (id: "prod_amagwinya", unit selling price: R5.00 / 500 cents)
- Slap chips small (id: "prod_chips_small", unit selling price: R20.00 / 2000 cents)
- Slap chips large (id: "prod_chips_large", unit selling price: R30.00 / 3000 cents)

Return ONLY a JSON array of objects conforming to:
[
  {
    "type": "sale" | "expense",
    "category": string (e.g. "sales", "stock", "utilities", "transport", "rent", "owner-draw"),
    "amountCents": integer cents (e.g. R180 = 18000),
    "description": string,
    "productId": string or null,
    "quantity": number or null,
    "confidence": number between 0 and 1
  }
]`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
          },
        }),
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return parseLogFallback(trimmed, ctx);
    }

    const data = await response.json();
    const rawJsonText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "[]";
    const rawData = JSON.parse(rawJsonText);
    const validated = ParsedEntriesArraySchema.parse(rawData);

    if (validated.length === 0) {
      return parseLogFallback(trimmed, ctx);
    }

    return validated;
  } catch {
    // Timeout, network failure, or schema invalidation -> safe fallback
    return parseLogFallback(trimmed, ctx);
  }
}
