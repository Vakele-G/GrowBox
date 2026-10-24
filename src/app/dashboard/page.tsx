import { BottomNav } from "@/components/bottom-nav";
import { Card, Pill, SectionTitle } from "@/components/ui";

export default function DashboardPlaceholderPage() {
  return (
    <div>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-leaf">GrowBox</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Grow</h1>
        <p className="mt-2 text-sm text-muted">
          Profit and cash-flow trends, stock cover, savings buffer and early warnings.
        </p>
      </header>

      <Card className="p-4">
        <SectionTitle title="Demo screen" />
        <p className="text-sm text-muted">
          The Stage 3 dashboard lands in its own milestone.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill tone="green">Profit</Pill>
          <Pill tone="lime">Runway</Pill>
          <Pill tone="amber">Stock</Pill>
        </div>
      </Card>
      <BottomNav />
    </div>
  );
}
