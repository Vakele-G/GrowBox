import { describe, expect, it, vi } from "vitest";
import { confirmAndSaveTransactions, deleteTransactionAction } from "@/app/log/actions";
import { getRepository } from "@/lib/db/repository";
import { DEMO_BUSINESS_ID } from "@/lib/db/seed";
import { parseLog } from "./adapter";
import { extractCents, parseLogFallback } from "./fallback";

describe("M04 — Fallback Natural Language Parser", () => {
  it("extracts cents accurately from South African currency strings", () => {
    expect(extractCents("R180")).toBe(18_000);
    expect(extractCents("R 260.50")).toBe(26_050);
    expect(extractCents("40 rands")).toBe(4_000);
    expect(extractCents("r50")).toBe(5_000);
    expect(extractCents("no money")).toBeNull();
  });

  it("parses the canonical demo phrase: 'I sold 40 gwinyas and bought oil for R180'", () => {
    const entries = parseLogFallback("I sold 40 gwinyas and bought oil for R180");
    expect(entries).toHaveLength(2);

    // Entry 1: Sale
    const sale = entries.find((e) => e.type === "sale");
    expect(sale).toBeDefined();
    expect(sale?.category).toBe("sales");
    expect(sale?.productId).toBe("prod_amagwinya");
    expect(sale?.quantity).toBe(40);
    expect(sale?.amountCents).toBe(20_000); // 40 * R5 = R200
    expect(sale?.description).toContain("Amagwinya x40");

    // Entry 2: Expense
    const expense = entries.find((e) => e.type === "expense");
    expect(expense).toBeDefined();
    expect(expense?.category).toBe("stock");
    expect(expense?.amountCents).toBe(18_000); // R180
    expect(expense?.description).toBe("Cooking oil");
  });

  it("parses slap chips small and large correctly", () => {
    const smallSale = parseLogFallback("Sold 10 slap chips small");
    expect(smallSale[0]?.type).toBe("sale");
    expect(smallSale[0]?.amountCents).toBe(20_000); // 10 * R20 = R200

    const largeSale = parseLogFallback("Sold 5 slap chips large");
    expect(largeSale[0]?.type).toBe("sale");
    expect(largeSale[0]?.amountCents).toBe(15_000); // 5 * R30 = R150
  });

  it("parses varied expense categories: transport, utilities, rent, owner-draw", () => {
    const transport = parseLogFallback("Taxi to wholesaler R40");
    expect(transport[0]?.type).toBe("expense");
    expect(transport[0]?.category).toBe("transport");
    expect(transport[0]?.amountCents).toBe(4_000);

    const utilities = parseLogFallback("Gas refill for R450");
    expect(utilities[0]?.type).toBe("expense");
    expect(utilities[0]?.category).toBe("utilities");
    expect(utilities[0]?.amountCents).toBe(45_000);

    const rent = parseLogFallback("Paid stall fee R50");
    expect(rent[0]?.type).toBe("expense");
    expect(rent[0]?.category).toBe("rent");
    expect(rent[0]?.amountCents).toBe(5_000);

    const draw = parseLogFallback("Owner draw to personal wallet R200");
    expect(draw[0]?.type).toBe("expense");
    expect(draw[0]?.category).toBe("owner-draw");
    expect(draw[0]?.amountCents).toBe(20_000);
  });
});

describe("M04 — AI Adapter & Fallback Resilience", () => {
  it("uses deterministic fallback when GEMINI_API_KEY is missing", async () => {
    // Process env without key
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const entries = await parseLog("I sold 40 gwinyas and bought oil for R180");
    expect(entries).toHaveLength(2);
    expect(entries[0]?.amountCents).toBe(20_000);
    expect(entries[1]?.amountCents).toBe(18_000);

    process.env.GEMINI_API_KEY = originalKey;
  });

  it("handles mocked Gemini structured JSON response", async () => {
    process.env.GEMINI_API_KEY = "test-mock-key-123456789";

    const mockResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify([
                  {
                    type: "sale",
                    category: "sales",
                    amountCents: 20_000,
                    description: "Amagwinya x40",
                    productId: "prod_amagwinya",
                    quantity: 40,
                    confidence: 0.98,
                  },
                ]),
              },
            ],
          },
        },
      ],
    };

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    }) as unknown as typeof fetch;

    const entries = await parseLog("I sold 40 gwinyas");
    expect(entries).toHaveLength(1);
    expect(entries[0]?.description).toBe("Amagwinya x40");
    expect(entries[0]?.confidence).toBe(0.98);

    globalThis.fetch = originalFetch;
    delete process.env.GEMINI_API_KEY;
  });

  it("falls back cleanly on network error or invalid JSON without crashing", async () => {
    process.env.GEMINI_API_KEY = "test-mock-key-123456789";

    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network timeout")) as unknown as typeof fetch;

    const entries = await parseLog("I sold 40 gwinyas and bought oil for R180");
    expect(entries).toHaveLength(2);
    expect(entries[0]?.amountCents).toBe(20_000);

    globalThis.fetch = originalFetch;
    delete process.env.GEMINI_API_KEY;
  });
});

describe("M04 — Confirmation Before Persistence & Ledger", () => {
  it("does not write to repository until confirmAndSaveTransactions is invoked", async () => {
    const repo = getRepository();
    const initialTxs = await repo.getTransactions(DEMO_BUSINESS_ID);
    const initialCount = initialTxs.length;

    // Parsing does NOT save to database
    const parsed = parseLogFallback("Sold 40 gwinyas");
    expect(parsed).toHaveLength(1);

    const recheck = await repo.getTransactions(DEMO_BUSINESS_ID);
    expect(recheck.length).toBe(initialCount);

    // Only user confirmation writes to ledger
    const saveRes = await confirmAndSaveTransactions(parsed, "text");
    expect(saveRes.success).toBe(true);
    expect(saveRes.inserted).toBe(1);

    const afterSave = await repo.getTransactions(DEMO_BUSINESS_ID);
    expect(afterSave.length).toBe(initialCount + 1);

    // Clean up created test tx
    const newTx = afterSave.find((t) => t.description.includes("Amagwinya x40"));
    if (newTx) {
      await deleteTransactionAction(newTx.id);
    }
  });

  it("tags transactions with correct source (text, manual, fnb)", async () => {
    const repo = getRepository();

    const saveRes = await confirmAndSaveTransactions(
      [
        {
          type: "expense",
          category: "stock",
          amountCents: 18_000,
          description: "Cooking oil test tag",
          productId: null,
          quantity: null,
          confidence: 0.95,
        },
      ],
      "manual",
    );
    expect(saveRes.success).toBe(true);

    const all = await repo.getTransactions(DEMO_BUSINESS_ID);
    const tagged = all.find((t) => t.description === "Cooking oil test tag");
    expect(tagged).toBeDefined();
    expect(tagged?.source).toBe("manual");

    if (tagged) {
      await repo.deleteTransaction(tagged.id);
    }
  });
});
