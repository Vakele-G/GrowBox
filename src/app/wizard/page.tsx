import { BottomNav } from "@/components/bottom-nav";
import { PersonaSwitcher } from "@/components/persona-switcher";
import { getRepository } from "@/lib/db/repository";
import { DEMO_BUSINESS_ID } from "@/lib/db/seed";
import { WizardForm } from "./wizard-form";

export const metadata = {
  title: "Stage 1: Launch & Costing Wizard",
};

export default async function WizardPage() {
  const repo = getRepository();
  const business = await repo.getBusiness(DEMO_BUSINESS_ID);
  const stageProgress = await repo.getStageProgress(DEMO_BUSINESS_ID);
  const currentStage = stageProgress?.stage ?? business?.stage ?? "idea";

  return (
    <main className="space-y-4 pb-16">
      <div className="flex items-center justify-between pt-1">
        <p className="text-xs font-bold uppercase tracking-wide text-leaf">GrowBox</p>
        <PersonaSwitcher currentStage={currentStage} />
      </div>
      <WizardForm />
      <BottomNav />
    </main>
  );
}
