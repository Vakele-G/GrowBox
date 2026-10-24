"use server";

import { getRepository } from "@/lib/db/repository";
import { DEMO_BUSINESS_ID } from "@/lib/db/seed";
import type { PlanItem, Product, ProductIngredient } from "@/lib/domain/types";
import type { Stage1Submission } from "./types";

export async function saveStage1Plan(data: Stage1Submission) {
  const repo = getRepository();
  const businessId = DEMO_BUSINESS_ID;

  // 1. Update business onboarding
  const business = await repo.getBusiness(businessId);
  if (business) {
    await repo.updateBusiness(businessId, {
      municipality: data.location,
      monthlyBudgetCents: data.budgetCents,
      onboarding: {
        completed: true,
        completedAt: new Date().toISOString(),
        location: data.location,
        budgetCents: data.budgetCents,
        equipment: data.equipmentOwned,
        customers: data.customers,
        practicality: {
          viable: data.viable,
          notes: data.notes,
        },
        costing: {
          productId: "prod_amagwinya",
          costPerUnitCents: data.unitCostCents,
          suggestedPriceCents: data.sellingPriceCents,
          marginPct: data.grossMarginPct,
          breakEvenUnitsPerDay: data.breakEvenUnitsPerDay,
        },
        launchPlan: data.launchPlan,
      },
    });
  }

  // 2. Save product
  const product: Product = {
    id: "prod_amagwinya",
    businessId,
    name: data.productName,
    unitLabel: "gwinya",
    sellingPriceCents: data.sellingPriceCents,
    batchYield: data.batchYield,
    isActive: true,
  };
  await repo.saveProduct(product);

  // 3. Save ingredients and product ingredients
  const links: ProductIngredient[] = [];
  for (const item of data.ingredients) {
    await repo.saveIngredient({
      id: item.id,
      businessId,
      name: item.name,
      packSize: item.packSize,
      packUnit: item.packUnit,
      packPriceCents: item.packPriceCents,
      lastPriceChangeAt: null,
    });
    links.push({
      productId: product.id,
      ingredientId: item.id,
      qtyPerUnit: item.qtyPerUnit,
    });
  }
  await repo.saveProductIngredients(links);

  // 4. Save plan items
  let sortOrder = 1;
  const planItems: PlanItem[] = [];

  for (const eq of ["Gas stove", "Pot", "Gas cylinder"]) {
    const owned = data.equipmentOwned.some((item) =>
      item.toLowerCase().includes(eq.toLowerCase()),
    );
    planItems.push({
      id: `plan_${eq.toLowerCase().replace(/\s+/g, "_")}`,
      businessId,
      kind: "equipment",
      label: `${eq} (${owned ? "owned" : "to buy"})`,
      estCostCents: owned ? 0 : 45_000,
      status: owned ? "done" : "todo",
      sortOrder: sortOrder++,
    });
  }

  for (const ing of data.ingredients.slice(0, 3)) {
    planItems.push({
      id: `plan_pack_${ing.id}`,
      businessId,
      kind: "ingredient",
      label: `${ing.name} ${ing.packSize}${ing.packUnit}`,
      estCostCents: ing.packPriceCents,
      status: "todo",
      sortOrder: sortOrder++,
    });
  }

  planItems.push({
    id: "plan_permit",
    businessId,
    kind: "task",
    label: "Apply for municipal street trading permit",
    estCostCents: 25_000,
    status: "todo",
    sortOrder: sortOrder++,
  });

  for (const item of planItems) {
    await repo.savePlanItem(item);
  }

  // 5. Update stage progress
  await repo.saveStageProgress({
    businessId,
    stage: "launch",
    stageStartedAt: new Date().toISOString(),
    completedChecks: ["costing_calculator", "practicality_check", "startup_plan"],
    updatedAt: new Date().toISOString(),
  });

  return { ok: true };
}
