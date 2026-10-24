import { BottomNav } from "@/components/bottom-nav";
import { Card, Pill, SectionTitle } from "@/components/ui";

export default function HomePlaceholderPage() {
  return (
    <div>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-leaf">GrowBox</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">
          From a street-side hustle to a bankable business.
        </h1>
        <p className="mt-2 text-sm text-muted">
          The proactive business mentor for South African informal entrepreneurs.
        </p>
      </header>

      <Card className="p-4">
        <SectionTitle title="Demo home" />
        <p className="text-sm text-muted">
          The product shell, design tokens and PWA manifest are in place. The live home
          dashboard, costing, logging and nudges land in the next milestones.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill tone="green">Stage shell</Pill>
          <Pill tone="lime">Design tokens</Pill>
          <Pill tone="amber">PWA manifest</Pill>
        </div>
      </Card>
      <BottomNav />
    </div>
  );
}
