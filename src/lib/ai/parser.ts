import type { ParsedEntry, Product } from "@/lib/domain/types";

const PRODUCT_ALIASES: Record<string, string[]> = {
  amagwinya: ["amagwinya", "magwinya", "gwinyas", "gwinya", "vetkoek", "fat cakes"],
  "slap chips small": ["small slap chips", "small chips", "small slap"],
  "slap chips large": ["large slap chips", "large chips", "large slap"],
  "slap chips": ["slap chips", "chips"],
};

const STOCK_WORDS = [
  "oil",
  "flour",
  "yeast",
  "sugar",
  "salt",
  "potato",
  "potatoes",
  "ingredient",
  "stock",
  "gas",
];
const TRANSPORT_WORDS = ["taxi", "transport", "uber", "bus", "petrol", "fuel"];
const UTILITY_WORDS = ["electricity", "electric", "water", "airtime", "data"];

const SALE_WORDS = /\b(sold|sell|sale|sales|earned|made|income|took)\b/i;
const EXPENSE_WORDS =
  /\b(bought|buy|paid|pay|spent|spend|expense|cost|costs|for)\b/i;

function normalise(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function findProduct(clause: string, products: Product[]): Product | null {
  const text = normalise(clause);
  let best: { product: Product; length: number } | null = null;

  for (const product of products) {
    const name = normalise(product.name);
    const aliases = [name, ...(PRODUCT_ALIASES[name] ?? [])];
    for (const alias of aliases) {
      if (text.includes(alias) && (!best || alias.length > best.length)) {
        best = { product, length: alias.length };
      }
    }
  }
  return best?.product ?? null;
}

function parseAmount(clause: string): number | null {
  const randFirst = clause.match(/R\s?(\d+(?:[.,]\d{1,2})?)/i);
  if (randFirst?.[1]) {
    return Math.round(Number.parseFloat(randFirst[1].replace(",", ".")) * 100);
  }
  const randAfter = clause.match(
    /(\d+(?:[.,]\d{1,2})?)\s*(?:rand|rands|bucks|r\b)/i,
  );
  if (randAfter?.[1]) {
    return Math.round(Number.parseFloat(randAfter[1].replace(",", ".")) * 100);
  }
  return null;
}

function parseQuantity(clause: string): number | null {
  const explicit = clause.match(
    /\b(?:sold|sell|sale)\s+(\d{1,5})\b/i,
  );
  if (explicit?.[1]) return Number.parseInt(explicit[1], 10);
  const beforeProduct = clause.match(
    /\b(\d{1,5})\s+(?:x\s+)?(?:amagwinya|magwinya|gwinyas?|gwinya|vetkoek|fat cakes|slap chips|chips)\b/i,
  );
  if (beforeProduct?.[1]) return Number.parseInt(beforeProduct[1], 10);
  return null;
}

function expenseCategory(clause: string): string {
  const text = normalise(clause);
  if (STOCK_WORDS.some((word) => text.includes(word))) return "stock";
  if (TRANSPORT_WORDS.some((word) => text.includes(word))) return "transport";
  if (UTILITY_WORDS.some((word) => text.includes(word))) return "utilities";
  return "other";
}

function cleanDescription(clause: string, amount: number | null): string {
  let description = clause
    .replace(/\bI\b/gi, "")
    .replace(/\b(?:sold|sell|bought|buy|paid|spent|for)\b/gi, "")
    .replace(/R\s?\d+(?:[.,]\d{1,2})?/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!description && amount !== null) description = "Entry";
  return description.charAt(0).toUpperCase() + description.slice(1);
}

export function parseLogFallback(text: string, products: Product[]): ParsedEntry[] {
  const clauses = text
    .split(/\s+(?:and|then)\s+|[,;]\s*/gi)
    .map((clause) => clause.trim())
    .filter(Boolean);
  const entries: ParsedEntry[] = [];

  for (const clause of clauses) {
    const isSale = SALE_WORDS.test(clause) && !/\b(bought|paid|spent)\b/i.test(clause);
    const isExpense = EXPENSE_WORDS.test(clause);
    if (!isSale && !isExpense) continue;

    const product = findProduct(clause, products);
    const quantity = parseQuantity(clause);
    let amountCents = parseAmount(clause);
    let confidence = 0.9;

    if (isSale) {
      if (amountCents === null && quantity !== null && product) {
        amountCents = quantity * product.sellingPriceCents;
        confidence = 0.75;
      }
      if (amountCents === null) continue;
      const soldQuantity =
        quantity ?? (product ? Math.max(1, Math.round(amountCents / product.sellingPriceCents)) : null);
      entries.push({
        type: "sale",
        category: "sales",
        amountCents,
        description: cleanDescription(clause, amountCents),
        quantity: soldQuantity,
        productId: product?.id ?? null,
        confidence,
      });
      continue;
    }

    if (isExpense) {
      if (amountCents === null) continue;
      entries.push({
        type: "expense",
        category: expenseCategory(clause),
        amountCents,
        description: cleanDescription(clause, amountCents),
        quantity: null,
        productId: null,
        confidence: 0.85,
      });
    }
  }

  return entries;
}
