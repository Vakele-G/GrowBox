import { describe, expect, it } from "vitest";
import { createMemoryRepository } from "@/lib/db/repository";
import { DEMO_BUSINESS_ID } from "@/lib/db/seed";
import { MockFnbSource } from "./fnb";

describe("M07 — MockFnbSource and Ingestion Pipeline", () => {
  const fnbSource = new MockFnbSource();

  it("produces realistic statement-shaped lines with proper types", () => {
    const lines = fnbSource.fetchStatementLines(DEMO_BUSINESS_ID);
    expect(lines.length).toBeGreaterThan(0);

    for (const line of lines) {
      expect(line.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(line.description.length).toBeGreaterThan(0);
      expect(line.amountCents).toBeGreaterThan(0);
      expect(["credit", "debit"]).toContain(line.direction);
      expect(line.reference).toContain("FNB-");
      expect(line.balanceCents).toBeGreaterThan(0);
    }
  });

  it("normalizes statement lines into transactions with fnb source and externalId", () => {
    const lines = fnbSource.fetchStatementLines(DEMO_BUSINESS_ID);
    const line = lines[0]!;
    const tx = fnbSource.normalizeToTransaction(line, DEMO_BUSINESS_ID);

    expect(tx.businessId).toBe(DEMO_BUSINESS_ID);
    expect(tx.source).toBe("fnb");
    expect(tx.externalId).toBe(line.reference);
    expect(tx.amountCents).toBe(line.amountCents);
    expect(tx.type).toBe("sale");
    expect(tx.confidence).toBe(1.0);
  });

  it("imports through the ledger pipeline and idempotently skips duplicates", async () => {
    const repo = createMemoryRepository();
    const lines = fnbSource.fetchStatementLines(DEMO_BUSINESS_ID);
    const transactions = lines.map((l) => fnbSource.normalizeToTransaction(l, DEMO_BUSINESS_ID));

    // First import
    const result1 = await repo.saveTransactions(transactions);
    expect(result1.inserted).toBe(transactions.length);
    expect(result1.skipped).toBe(0);

    const initialLedger = await repo.getTransactions(DEMO_BUSINESS_ID);
    const fnbInitialCount = initialLedger.filter((t) => t.source === "fnb").length;
    expect(fnbInitialCount).toBe(transactions.length);

    // Second import with identical statement lines
    const result2 = await repo.saveTransactions(transactions);
    expect(result2.inserted).toBe(0);
    expect(result2.skipped).toBe(transactions.length);

    // Ledger count remains exactly the same
    const postLedger = await repo.getTransactions(DEMO_BUSINESS_ID);
    const fnbPostCount = postLedger.filter((t) => t.source === "fnb").length;
    expect(fnbPostCount).toBe(transactions.length);
  });
});
