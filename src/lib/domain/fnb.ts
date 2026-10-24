import type { Transaction, TransactionSource as TransactionSourceType } from "./types";

export interface FnbStatementLine {
  date: string;
  description: string;
  amountCents: number;
  direction: "credit" | "debit";
  balanceCents: number;
  reference: string;
  category: string;
}

export interface TransactionSource {
  readonly name: string;
  readonly sourceType: TransactionSourceType;
  fetchStatementLines(businessId: string): FnbStatementLine[];
  normalizeToTransaction(line: FnbStatementLine, businessId: string): Transaction;
}

/**
 * Mock FNB Transaction Feed Generator.
 * Produces statement-shaped lines representing typical township business activity:
 * POS card settlements, cash deposits, wholesale purchases, prepaid utilities, and eWallet withdrawals.
 */
export class MockFnbSource implements TransactionSource {
  readonly name = "Simulated FNB Feed";
  readonly sourceType: TransactionSourceType = "fnb";

  fetchStatementLines(businessId: string): FnbStatementLine[] {
    const lines: FnbStatementLine[] = [
      {
        date: "2026-10-20",
        description: "FNB Speedpoint Settlement (Card Sales)",
        amountCents: 42_000,
        direction: "credit",
        balanceCents: 242_000,
        reference: "FNB-POS-20261020-001",
        category: "sales",
      },
      {
        date: "2026-10-21",
        description: "Bulk Wholesale Ingredients (Oil & Flour)",
        amountCents: 28_000,
        direction: "debit",
        balanceCents: 214_000,
        reference: "FNB-EFT-20261021-002",
        category: "stock",
      },
      {
        date: "2026-10-22",
        description: "FNB Speedpoint Settlement (Card Sales)",
        amountCents: 55_000,
        direction: "credit",
        balanceCents: 269_000,
        reference: "FNB-POS-20261022-003",
        category: "sales",
      },
      {
        date: "2026-10-23",
        description: "Prepaid Electricity Token City Power",
        amountCents: 15_000,
        direction: "debit",
        balanceCents: 254_000,
        reference: "FNB-UTIL-20261023-004",
        category: "utilities",
      },
      {
        date: "2026-10-24",
        description: "FNB Speedpoint Settlement (Card Sales)",
        amountCents: 60_000,
        direction: "credit",
        balanceCents: 314_000,
        reference: "FNB-POS-20261024-005",
        category: "sales",
      },
      {
        date: "2026-10-24",
        description: "FNB eWallet Cash Send (Owner Draw)",
        amountCents: 20_000,
        direction: "debit",
        balanceCents: 294_000,
        reference: "FNB-EWL-20261024-006",
        category: "owner-draw",
      },
    ];

    // Guarantee external ids are scoped per business if needed, or deterministic for demo
    return lines.map((l) => ({
      ...l,
      reference: `${l.reference}-${businessId.slice(0, 8)}`,
    }));
  }

  normalizeToTransaction(line: FnbStatementLine, businessId: string): Transaction {
    const isCredit = line.direction === "credit";
    return {
      id: `tx_${line.reference.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      businessId,
      occurredOn: line.date,
      type: isCredit ? "sale" : "expense",
      category: line.category,
      amountCents: line.amountCents,
      description: line.description,
      productId: isCredit ? "prod_amagwinya" : null,
      quantity: isCredit ? Math.round(line.amountCents / 500) : null,
      source: "fnb",
      externalId: line.reference,
      confidence: 1.0,
      createdAt: `${line.date}T17:00:00+02:00`,
    };
  }
}

export const mockFnbSource = new MockFnbSource();
