import { createServerSupabaseClient } from "../src/lib/db/client";
import { createSeedData, DEMO_BUSINESS_ID } from "../src/lib/db/seed";

/**
 * Idempotent demo seed: rebuilds Nomsa's Kitchen demo persona and history.
 * Safe to run multiple times — existing demo rows are removed before insert.
 *
 * Usage:
 *   npx tsx scripts/seed.ts           # seeds full 30-day Stage 3 history
 *   npx tsx scripts/seed.ts --minimal # seeds minimal Stage 1 idea persona
 */
export async function runSeed(mode: "full" | "minimal" = "full") {
  const supabase = createServerSupabaseClient();
  const data = createSeedData(undefined, mode);

  console.log(`Seeding Nomsa's Kitchen in ${mode} mode...`);

  // 1. Clean up existing demo data in dependency order
  const tablesToClean = [
    "transactions",
    "plan_items",
    "stage_progress",
    "nudges",
    "health_scores",
    "product_ingredients",
    "products",
    "ingredients",
  ];

  for (const table of tablesToClean) {
    if (table === "product_ingredients") {
      // product_ingredients joins through products
      const { data: prods } = await supabase
        .from("products")
        .select("id")
        .eq("business_id", DEMO_BUSINESS_ID);
      if (prods && prods.length > 0) {
        const prodIds = prods.map((p) => p.id);
        await supabase.from("product_ingredients").delete().in("product_id", prodIds);
      }
    } else {
      await supabase.from(table).delete().eq("business_id", DEMO_BUSINESS_ID);
    }
  }

  // Delete business
  await supabase.from("businesses").delete().eq("id", DEMO_BUSINESS_ID);

  // 2. Insert mapped records with snake_case columns
  // Businesses
  const mappedBusinesses = data.businesses.map((b) => ({
    id: b.id,
    owner_id: b.ownerId,
    name: b.name,
    stage: b.stage,
    municipality: b.municipality,
    language: b.language,
    monthly_budget_cents: b.monthlyBudgetCents,
    onboarding: b.onboarding,
    created_at: b.createdAt,
  }));
  const { error: bErr } = await supabase.from("businesses").insert(mappedBusinesses);
  if (bErr) throw new Error(`Business insert failed: ${bErr.message}`);

  // Products
  const mappedProducts = data.products.map((p) => ({
    id: p.id,
    business_id: p.businessId,
    name: p.name,
    unit_label: p.unitLabel,
    selling_price_cents: p.sellingPriceCents,
    batch_yield: p.batchYield,
    is_active: p.isActive,
  }));
  const { error: pErr } = await supabase.from("products").insert(mappedProducts);
  if (pErr) throw new Error(`Products insert failed: ${pErr.message}`);

  // Ingredients
  const mappedIngredients = data.ingredients.map((i) => ({
    id: i.id,
    business_id: i.businessId,
    name: i.name,
    pack_size: i.packSize,
    pack_unit: i.packUnit,
    pack_price_cents: i.packPriceCents,
    last_price_change_at: i.lastPriceChangeAt,
  }));
  const { error: iErr } = await supabase.from("ingredients").insert(mappedIngredients);
  if (iErr) throw new Error(`Ingredients insert failed: ${iErr.message}`);

  // Product Ingredients
  const mappedProductIngredients = data.productIngredients.map((pi) => ({
    product_id: pi.productId,
    ingredient_id: pi.ingredientId,
    qty_per_unit: pi.qtyPerUnit,
  }));
  if (mappedProductIngredients.length > 0) {
    const { error: piErr } = await supabase
      .from("product_ingredients")
      .insert(mappedProductIngredients);
    if (piErr) throw new Error(`Product ingredients insert failed: ${piErr.message}`);
  }

  // Transactions
  if (data.transactions.length > 0) {
    const mappedTransactions = data.transactions.map((t) => ({
      id: t.id,
      business_id: t.businessId,
      occurred_on: t.occurredOn,
      type: t.type,
      category: t.category,
      amount_cents: t.amountCents,
      description: t.description,
      product_id: t.productId,
      quantity: t.quantity,
      source: t.source,
      external_id: t.externalId,
      confidence: t.confidence,
      created_at: t.createdAt,
    }));
    const { error: tErr } = await supabase.from("transactions").insert(mappedTransactions);
    if (tErr) throw new Error(`Transactions insert failed: ${tErr.message}`);
  }

  // Plan Items
  if (data.planItems.length > 0) {
    const mappedPlanItems = data.planItems.map((pi) => ({
      id: pi.id,
      business_id: pi.businessId,
      kind: pi.kind,
      label: pi.label,
      est_cost_cents: pi.estCostCents,
      status: pi.status,
      sort_order: pi.sortOrder,
    }));
    const { error: plErr } = await supabase.from("plan_items").insert(mappedPlanItems);
    if (plErr) throw new Error(`Plan items insert failed: ${plErr.message}`);
  }

  // Stage Progress
  if (data.stageProgress.length > 0) {
    const mappedStageProgress = data.stageProgress.map((sp) => ({
      business_id: sp.businessId,
      stage: sp.stage,
      stage_started_at: sp.stageStartedAt,
      completed_checks: sp.completedChecks,
      updated_at: sp.updatedAt,
    }));
    const { error: spErr } = await supabase
      .from("stage_progress")
      .insert(mappedStageProgress);
    if (spErr) throw new Error(`Stage progress insert failed: ${spErr.message}`);
  }

  // Knowledge Chunks (upsert so running multiple times is safe)
  if (data.knowledgeChunks.length > 0) {
    const mappedKnowledge = data.knowledgeChunks.map((kc) => ({
      id: kc.id,
      jurisdiction: kc.jurisdiction,
      topic: kc.topic,
      title: kc.title,
      requirement: kc.requirement,
      source_url: kc.sourceUrl,
      last_verified: kc.lastVerified,
      disclaimer: kc.disclaimer,
    }));
    const { error: kcErr } = await supabase
      .from("knowledge_chunks")
      .upsert(mappedKnowledge, { onConflict: "id" });
    if (kcErr) throw new Error(`Knowledge chunks upsert failed: ${kcErr.message}`);
  }

  console.log(`Seed complete: Nomsa's Kitchen (${mode} mode) successfully restored.`);
}

const isDirectRun =
  typeof process !== "undefined" &&
  process.argv[1] &&
  (process.argv[1].endsWith("seed.ts") || process.argv[1].endsWith("seed.js"));

if (isDirectRun) {
  const mode = process.argv.includes("--minimal") ? "minimal" : "full";
  runSeed(mode)
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error("Seed error:", error);
      process.exit(1);
    });
}
