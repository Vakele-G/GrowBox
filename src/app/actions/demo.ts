"use server";

import { revalidatePath } from "next/cache";
import { getRepository, MemoryRepository } from "@/lib/db/repository";
import { runSeed } from "@/lib/db/seed-run";
import { createSeedData } from "@/lib/db/seed";

/**
 * Resets the demo persona between:
 * - "minimal": Stage 1 (Idea) with 0 transactions and uncompleted onboarding.
 * - "full": Stage 3 (Stable) with 14-30 days of trading records, warnings, and nudges.
 */
export async function resetDemoPersonaAction(mode: "minimal" | "full"): Promise<{ success: boolean; mode: string }> {
  const repo = getRepository();

  if (repo instanceof MemoryRepository) {
    repo.reset(createSeedData(undefined, mode));
  } else {
    // Supabase-backed: the persona lives in the database, so rebuild it there.
    await runSeed(mode);
  }

  revalidatePath("/");
  revalidatePath("/wizard");
  revalidatePath("/dashboard");
  revalidatePath("/health");
  revalidatePath("/health/record");
  revalidatePath("/ledger");
  revalidatePath("/log");

  return { success: true, mode };
}
