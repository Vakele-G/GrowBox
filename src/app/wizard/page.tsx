import { BottomNav } from "@/components/bottom-nav";
import { WizardForm } from "./wizard-form";

export const metadata = {
  title: "Stage 1: Launch & Costing Wizard",
};

export default function WizardPage() {
  return (
    <main className="pb-16">
      <WizardForm />
      <BottomNav />
    </main>
  );
}
