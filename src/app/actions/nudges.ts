"use server";

import { revalidatePath } from "next/cache";
import { getRepository } from "@/lib/db/repository";
import { DEMO_BUSINESS_ID } from "@/lib/db/seed";
import type { Language, NudgeStatus, Stage } from "@/lib/domain/types";

/**
 * Updates the read/actioned status of a proactive nudge.
 */
export async function updateNudgeStatusAction(
  nudgeId: string,
  status: NudgeStatus,
): Promise<{ success: boolean }> {
  const repo = getRepository();
  await repo.updateNudgeStatus(nudgeId, status);
  revalidatePath("/");
  return { success: true };
}

/**
 * Triggers a stage transition (e.g. Stable -> Grow).
 */
export async function advanceStageAction(
  targetStage: Stage,
): Promise<{ success: boolean; stage: Stage }> {
  const repo = getRepository();
  const existing = await repo.getStageProgress(DEMO_BUSINESS_ID);
  const now = new Date().toISOString();

  await repo.saveStageProgress({
    businessId: DEMO_BUSINESS_ID,
    stage: targetStage,
    stageStartedAt: existing?.stageStartedAt ?? now,
    completedChecks: [...(existing?.completedChecks ?? []), `${targetStage}_advance_actioned`],
    updatedAt: now,
  });

  await repo.updateBusiness(DEMO_BUSINESS_ID, { stage: targetStage });
  revalidatePath("/");
  return { success: true, stage: targetStage };
}

/**
 * Toggles the user's persisted language preference (en / zu).
 */
export async function toggleLanguageAction(
  newLang: Language,
): Promise<{ success: boolean; language: Language }> {
  const repo = getRepository();
  await repo.updateBusiness(DEMO_BUSINESS_ID, { language: newLang });
  revalidatePath("/");
  return { success: true, language: newLang };
}
