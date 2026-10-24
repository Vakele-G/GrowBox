import type { ParsedEntry, Product } from "@/lib/domain/types";
import type { ParseContext } from "./types";

/**
 * Extracts money in cents from a string segment.
 * Matches: "R180", "R 180", "180 rands", "r180", "R180.50", "180.00"
 */
export function extractCents(text: string): number | null {
  const match = text.match(/(?:R\s*|r\s*)?(\d+(?:[.,]\d{1,2})?)(?:\s*(?:rands?|rand))?/i);
  if (!match || !match[1]) return null;
  const num = parseFloat(match[1].replace(",", "."));
  if (isNaN(num)) return null;
  return Math.round(num * 100);
}

/**
 * Deterministic fallback parser for transaction logging.
 * Handles single or compound natural-language entries, e.g.:
 * "I sold 40 gwinyas and bought oil for R180"
 */
export function parseLogFallback(
  text: string,
  ctx?: ParseContext,
): ParsedEntry[] {
  const clean = text.trim();
  if (!clean) return [];

  // Split compound phrases by ' and ', commas, semicolons, or newlines
  const segments = clean
    .split(/(?:\s+and\s+|[,;\n]+|\s+then\s+|\s+plus\s+)/i)
    .map((s) => s.trim())
    .filter(Boolean);

  const entries: ParsedEntry[] = [];
  const products = ctx?.products ?? [
    {
      id: "prod_amagwinya",
      businessId: "biz_nomsa_kitchen",
      name: "Amagwinya",
      unitLabel: "gwinya",
      sellingPriceCents: 500,
      batchYield: 30,
      isActive: true,
    },
    {
      id: "prod_chips_small",
      businessId: "biz_nomsa_kitchen",
      name: "Slap chips small",
      unitLabel: "portion",
      sellingPriceCents: 2_000,
      batchYield: 10,
      isActive: true,
    },
    {
      id: "prod_chips_large",
      businessId: "biz_nomsa_kitchen",
      name: "Slap chips large",
      unitLabel: "portion",
      sellingPriceCents: 3_000,
      batchYield: 8,
      isActive: true,
    },
  ];

  for (const seg of segments) {
    const isSale = /\b(sold|sell|sales|takings|made)\b/i.test(seg);
    const isExpense = /\b(bought|buy|paid|expense|spent|cost|purchased|refill|fee)\b/i.test(
      seg,
    );

    // 1. Try matching sales
    if (isSale || (!isExpense && /\b(gwinya|chips|portion)\b/i.test(seg))) {
      const parsedSale = parseSaleSegment(seg, products);
      if (parsedSale) {
        entries.push(parsedSale);
        continue;
      }
    }

    // 2. Try matching expense
    const parsedExpense = parseExpenseSegment(seg);
    if (parsedExpense) {
      entries.push(parsedExpense);
      continue;
    }

    // 3. Fallback generic sale if amount and sale keyword present
    if (isSale) {
      const cents = extractCents(seg.replace(/\b(sold|sell|sales)\b/i, ""));
      if (cents) {
        entries.push({
          type: "sale",
          category: "sales",
          amountCents: cents,
          description: "Daily sales",
          productId: null,
          quantity: null,
          confidence: 0.8,
        });
      }
    }
  }

  return entries;
}

function parseSaleSegment(seg: string, products: Product[]): ParsedEntry | null {
  // Check for quantity (e.g. "40 gwinyas", "15 small chips", "sold 40")
  const qtyMatch = seg.match(/\b(\d+)\s*(?:x\s*)?([a-zA-Z\s]+)?/i);
  let quantity: number | null = null;
  if (qtyMatch && qtyMatch[1]) {
    const parsed = parseInt(qtyMatch[1], 10);
    if (!isNaN(parsed) && parsed > 0 && parsed < 10_000) {
      quantity = parsed;
    }
  }

  // Detect which product is mentioned
  let matchedProduct: Product | null = null;
  const lower = seg.toLowerCase();

  if (lower.includes("gwinya") || lower.includes("magwinya") || lower.includes("vetkoek")) {
    matchedProduct =
      products.find((p) => p.id === "prod_amagwinya" || p.name.toLowerCase().includes("gwinya")) ??
      products[0] ??
      null;
  } else if (lower.includes("small") && lower.includes("chip")) {
    matchedProduct =
      products.find((p) => p.name.toLowerCase().includes("small")) ?? null;
  } else if (lower.includes("large") && lower.includes("chip")) {
    matchedProduct =
      products.find((p) => p.name.toLowerCase().includes("large")) ?? null;
  } else if (lower.includes("chip")) {
    matchedProduct =
      products.find((p) => p.name.toLowerCase().includes("small")) ??
      products[1] ??
      null;
  }

  if (matchedProduct && quantity) {
    const amountCents = quantity * matchedProduct.sellingPriceCents;
    return {
      type: "sale",
      category: "sales",
      amountCents,
      description: `${matchedProduct.name} x${quantity}`,
      productId: matchedProduct.id,
      quantity,
      confidence: 0.95,
    };
  }

  // Explicit amount in sale (e.g. "sold gwinyas for R200")
  const explicitCents = extractCents(seg);
  if (explicitCents && matchedProduct) {
    return {
      type: "sale",
      category: "sales",
      amountCents: explicitCents,
      description: matchedProduct.name,
      productId: matchedProduct.id,
      quantity: quantity ?? Math.round(explicitCents / matchedProduct.sellingPriceCents),
      confidence: 0.9,
    };
  }

  return null;
}

function parseExpenseSegment(seg: string): ParsedEntry | null {
  const lower = seg.toLowerCase();
  const cents = extractCents(seg);
  if (!cents) return null;

  let category = "other";
  let description = "Expense";

  if (lower.includes("oil")) {
    category = "stock";
    description = "Cooking oil";
  } else if (lower.includes("flour")) {
    category = "stock";
    description = "Cake flour";
  } else if (lower.includes("potato") || lower.includes("potatoes")) {
    category = "stock";
    description = "Potatoes";
  } else if (lower.includes("sugar")) {
    category = "stock";
    description = "White sugar";
  } else if (lower.includes("yeast")) {
    category = "stock";
    description = "Instant yeast";
  } else if (lower.includes("gas") || lower.includes("refill") || lower.includes("cylinder")) {
    category = "utilities";
    description = "Gas cylinder refill";
  } else if (lower.includes("taxi") || lower.includes("transport") || lower.includes("fare")) {
    category = "transport";
    description = "Wholesaler transport";
  } else if (lower.includes("stall") || lower.includes("rent") || lower.includes("fee")) {
    category = "rent";
    description = "Stall fee";
  } else if (lower.includes("draw") || lower.includes("wallet") || lower.includes("personal")) {
    category = "owner-draw";
    description = "Owner draw";
  } else if (lower.includes("bag") || lower.includes("packaging")) {
    category = "stock";
    description = "Paper bags";
  } else {
    category = "stock";
    description = seg.replace(/^(?:bought|paid for|bought for|paid)\s+/i, "").trim() || "Stock";
  }

  return {
    type: "expense",
    category,
    amountCents: cents,
    description,
    productId: null,
    quantity: null,
    confidence: 0.95,
  };
}
