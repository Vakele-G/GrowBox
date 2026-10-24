import { createServerSupabaseClient } from "../src/lib/db/client";
import { createSeedData, DEMO_BUSINESS_ID } from "../src/lib/db/seed";

/**
 * Idempotent demo seed: rebuilds Nomsa's Kitchen demo persona and history.
 * Safe to run twice — existing demo rows are removed before insert.
 */
async function main() {
  const supabase = createServerSupabaseClient();
  const data = createSeedData();

  const { error: deleteError } = await supabase
    .from("transactions")
    .delete()
    .eq("business_id", DEMO_BUSINESS_ID);
  if (deleteError) throw new Error(deleteError.message);

  const { error: deletePlanError } = await supabase
    .from("plan_items")
    .delete()
    .eq("business_id", DEMO_BUSINESS_ID);
  if (deletePlanError) throw new Error(deletePlanError.message);

  const { error: deleteStageError } = await supabase
    .from("stage_progress")
    .delete()
    .eq("business_id", DEMO_BUSINESS_ID);
  if (deleteStageError) throw new Error(deleteStageError.message);

  const { error: deleteProductsError } = await supabase
    .from("products")
    .delete()
    .eq("business_id", DEMO_BUSINESS_ID);
  if (deleteProductsError) throw new Error(deleteProductsError.message);

  const { error: deleteIngredientsError } = await supabase
    .from("ingredients")
    .delete()
    .eq("business_id", DEMO_BUSINESS_ID);
  if (deleteIngredientsError) throw new Error(deleteIngredientsError.message);

  const { error: deleteNudgesError } = await supabase
    .from("nudges")
    .delete()
    .eq("business_id", DEMO_BUSINESS_ID);
  if (deleteNudgesError) throw new Error(deleteNudgesError.message);

  const { error: deleteScoresError } = await supabase
    .from("health_scores")
    .delete()
    .eq("business_id", DEMO_BUSINESS_ID);
  if (deleteScoresError) throw new Error(deleteScoresError.message);

  const { error: deleteBusinessError } = await supabase
    .from("businesses")
    .delete()
    .eq("id", DEMO_BUSINESS_ID);
  if (deleteBusinessError) throw new Error(deleteBusinessError.message);

  const { error: insertBusinessError } = await supabase.from("businesses").insert(data.businesses);
  if (insertBusinessError) throw new Error(insertBusinessError.message);

  const { error: insertProductsError } = await supabase
    .from("products")
    .insert(data.products);
  if (insertProductsError) throw new Error(insertProductsError.message);

  const { error: insertIngredientsError } = await supabase
    .from("ingredients")
    .insert(data.ingredients);
  if (insertIngredientsError) throw new Error(insertIngredientsError.message);

  const { error: insertProductIngredientsError } = await supabase
    .from("product_ingredients")
    .insert(data.productIngredients);
  if (insertProductIngredientsError) throw new Error(insertProductIngredientsError.message);

  const { error: insertTransactionsError } = await supabase
    .from("transactions")
    .insert(data.transactions);
  if (insertTransactionsError) throw new Error(insertTransactionsError.message);

  const { error: insertPlanError } = await supabase.from("plan_items").insert(data.planItems);
  if (insertPlanError) throw new Error(insertPlanError.message);

  const { error: insertStageError } = await supabase
    .from("stage_progress")
    .insert(data.stageProgress);
  if (insertStageError) throw new Error(insertStageError.message);

  const { error: insertKnowledgeError } = await supabase
    .from("knowledge_chunks")
    .insert(data.knowledgeChunks);
  if (insertKnowledgeError) throw new Error(insertKnowledgeError.message);

  console.log("Seed complete: Nomsa's Kitchen demo persona restored.");
}

main()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
