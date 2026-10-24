"use server";

import { revalidatePath } from "next/cache";
import { getRepository } from "@/lib/db/repository";
import { DEMO_BUSINESS_ID } from "@/lib/db/seed";
import { mockFnbSource } from "@/lib/domain/fnb";

export async function importFnbStatementAction(): Promise<{
  success: boolean;
  inserted: number;
  skipped: number;
  total: number;
}> {
  const repo = getRepository();
  const lines = mockFnbSource.fetchStatementLines(DEMO_BUSINESS_ID);
  const transactions = lines.map((line) =>
    mockFnbSource.normalizeToTransaction(line, DEMO_BUSINESS_ID),
  );

  const result = await repo.saveTransactions(transactions);

  revalidatePath("/health");
  revalidatePath("/health/import");
  revalidatePath("/health/record");
  revalidatePath("/ledger");
  revalidatePath("/dashboard");
  revalidatePath("/");

  return {
    success: true,
    inserted: result.inserted,
    skipped: result.skipped,
    total: transactions.length,
  };
}
