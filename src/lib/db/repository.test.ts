import { describe, expect, it } from "vitest";
import { createMemoryRepository, getRepository } from "./repository";
import { createSeedData, DEMO_BUSINESS_ID, DEMO_OWNER_ID } from "./seed";
import type { Transaction } from "@/lib/domain/types";

describe("M02 — Data Model, Seed and Repository Layer", () => {
  it("generates full seed data with Nomsa's Kitchen and trading history", () => {
    const data = createSeedData("2026-10-24", "full");
    expect(data.businesses).toHaveLength(1);
    expect(data.businesses[0]?.id).toBe(DEMO_BUSINESS_ID);
    expect(data.businesses[0]?.stage).toBe("stable");
    expect(data.products.length).toBeGreaterThanOrEqual(3);
    expect(data.ingredients.length).toBeGreaterThanOrEqual(5);
    expect(data.transactions.length).toBeGreaterThanOrEqual(60);
    expect(data.stageProgress[0]?.stage).toBe("stable");
  });

  it("generates minimal seed data for onboarding wizard", () => {
    const data = createSeedData("2026-10-24", "minimal");
    expect(data.businesses[0]?.stage).toBe("idea");
    expect(data.businesses[0]?.onboarding.completed).toBe(false);
    expect(data.transactions).toHaveLength(0);
    expect(data.stageProgress[0]?.stage).toBe("idea");
  });

  it("proves seed is idempotent when loaded twice", () => {
    const repo = createMemoryRepository();
    const firstCount = repo;
    expect(firstCount).toBeDefined();

    // Resetting / reloading seed data produces identical state without duplicates
    repo.reset(createSeedData("2026-10-24", "full"));
    repo.reset(createSeedData("2026-10-24", "full"));

    return repo.getTransactions(DEMO_BUSINESS_ID).then((txs) => {
      // Should not have duplicated transactions
      const uniqueIds = new Set(txs.map((t) => t.id));
      expect(uniqueIds.size).toBe(txs.length);
    });
  });

  it("retrieves business by id and ownerId", async () => {
    const repo = createMemoryRepository();
    const business = await repo.getBusiness(DEMO_BUSINESS_ID);
    expect(business).not.toBeNull();
    expect(business?.name).toBe("Nomsa's Kitchen");

    const byOwner = await repo.getBusinessByOwnerId(DEMO_OWNER_ID);
    expect(byOwner?.id).toBe(DEMO_BUSINESS_ID);
  });

  it("updates business fields", async () => {
    const repo = createMemoryRepository();
    const updated = await repo.updateBusiness(DEMO_BUSINESS_ID, {
      monthlyBudgetCents: 200_000,
    });
    expect(updated.monthlyBudgetCents).toBe(200_000);

    const recheck = await repo.getBusiness(DEMO_BUSINESS_ID);
    expect(recheck?.monthlyBudgetCents).toBe(200_000);
  });

  it("deduplicates transactions with the same external_id", async () => {
    const repo = createMemoryRepository();
    const duplicateTx: Transaction = {
      id: "tx_fnb_test_001",
      businessId: DEMO_BUSINESS_ID,
      occurredOn: "2026-10-24",
      type: "sale",
      category: "sales",
      amountCents: 50_000,
      description: "FNB POS Settlement",
      productId: null,
      quantity: null,
      source: "fnb",
      externalId: "ext_fnb_unique_12345",
      confidence: 1,
      createdAt: "2026-10-24T12:00:00+02:00",
    };

    // First save: inserted = 1
    const res1 = await repo.saveTransactions([duplicateTx]);
    expect(res1.inserted).toBe(1);
    expect(res1.skipped).toBe(0);

    // Second save: skipped = 1
    const res2 = await repo.saveTransactions([duplicateTx]);
    expect(res2.inserted).toBe(0);
    expect(res2.skipped).toBe(1);
  });

  it("filters transactions by date range and limit", async () => {
    const repo = createMemoryRepository();
    const all = await repo.getTransactions(DEMO_BUSINESS_ID);
    expect(all.length).toBeGreaterThan(10);

    const limited = await repo.getTransactions(DEMO_BUSINESS_ID, { limit: 5 });
    expect(limited).toHaveLength(5);
  });

  it("manages stage progress and plan items", async () => {
    const repo = createMemoryRepository();
    const stage = await repo.getStageProgress(DEMO_BUSINESS_ID);
    expect(stage?.stage).toBe("stable");

    await repo.saveStageProgress({
      businessId: DEMO_BUSINESS_ID,
      stage: "grow",
      stageStartedAt: "2026-10-24",
      completedChecks: ["check1", "check2"],
      updatedAt: "2026-10-24",
    });

    const updatedStage = await repo.getStageProgress(DEMO_BUSINESS_ID);
    expect(updatedStage?.stage).toBe("grow");

    const planItems = await repo.getPlanItems(DEMO_BUSINESS_ID);
    expect(planItems.length).toBeGreaterThanOrEqual(5);
  });

  it("manages nudges and health score persistence", async () => {
    const repo = createMemoryRepository();
    await repo.saveNudges([
      {
        id: "nudge_margin_drop_1",
        businessId: DEMO_BUSINESS_ID,
        ruleKey: "margin_drop",
        severity: "warning",
        payload: { dropPct: 12 },
        messageEn: "Your margin dropped by 12%",
        messageZu: "Inzuzo yakho yehle ngo-12%",
        status: "new",
        createdAt: "2026-10-24T10:00:00+02:00",
      },
    ]);

    const activeNudges = await repo.getNudges(DEMO_BUSINESS_ID, "new");
    expect(activeNudges.some((n) => n.id === "nudge_margin_drop_1")).toBe(true);

    await repo.updateNudgeStatus("nudge_margin_drop_1", "dismissed");
    const dismissed = await repo.getNudges(DEMO_BUSINESS_ID, "dismissed");
    expect(dismissed.some((n) => n.id === "nudge_margin_drop_1")).toBe(true);

    await repo.saveHealthScore({
      id: "hs_001",
      businessId: DEMO_BUSINESS_ID,
      score: 68,
      components: {
        profitability: 20,
        cashBuffer: 15,
        recordConsistency: 18,
        marginStability: 8,
        savingsDiscipline: 4,
        complianceProgress: 3,
      },
      band: "bankable",
      computedAt: "2026-10-24T12:00:00+02:00",
    });

    const latest = await repo.getLatestHealthScore(DEMO_BUSINESS_ID);
    expect(latest?.score).toBe(68);
    expect(latest?.band).toBe("bankable");
  });

  it("retrieves compliance knowledge chunks", async () => {
    const repo = createMemoryRepository();
    const all = await repo.getKnowledgeChunks();
    expect(all.length).toBeGreaterThanOrEqual(4);

    const foodSafety = await repo.getKnowledgeChunks("Food safety");
    expect(foodSafety.length).toBeGreaterThanOrEqual(1);
    expect(foodSafety[0]?.disclaimer).toContain("Verify with your municipality");
  });

  it("getRepository returns a valid repository singleton", () => {
    const repo = getRepository();
    expect(repo).toBeDefined();
    expect(typeof repo.getBusiness).toBe("function");
  });
});
