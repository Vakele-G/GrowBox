"use server";

import { parseLog } from "@/lib/ai/adapter";
import { getRepository } from "@/lib/db/repository";
import { DEMO_BUSINESS_ID } from "@/lib/db/seed";
import { today } from "@/lib/domain/dates";
import type { ParsedEntry, Transaction, TransactionSource } from "@/lib/domain/types";

export async function parseLogAction(text: string): Promise<ParsedEntry[]> {
  const repo = getRepository();
  const products = await repo.getProducts(DEMO_BUSINESS_ID);
  return parseLog(text, { products });
}

export async function confirmAndSaveTransactions(
  entries: ParsedEntry[],
  source: TransactionSource = "text",
  occurredOn: string = today(),
): Promise<{ success: boolean; inserted: number; skipped: number }> {
  if (entries.length === 0) {
    return { success: true, inserted: 0, skipped: 0 };
  }

  const repo = getRepository();
  const txs: Transaction[] = entries.map((entry, idx) => ({
    id: `tx_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
    businessId: DEMO_BUSINESS_ID,
    occurredOn,
    type: entry.type,
    category: entry.category,
    amountCents: entry.amountCents,
    description: entry.description,
    productId: entry.productId,
    quantity: entry.quantity,
    source,
    externalId: null,
    confidence: entry.confidence,
    createdAt: `${occurredOn}T12:00:00+02:00`,
  }));

  const res = await repo.saveTransactions(txs);
  return { success: true, inserted: res.inserted, skipped: res.skipped };
}

export async function deleteTransactionAction(id: string): Promise<{ success: boolean }> {
  const repo = getRepository();
  await repo.deleteTransaction(id);
  return { success: true };
}
