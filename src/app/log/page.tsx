import { BottomNav } from "@/components/bottom-nav";
import { Card, Pill, SectionTitle } from "@/components/ui";

export default function LogPlaceholderPage() {
  return (
    <div>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-leaf">GrowBox</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Log trading</h1>
        <p className="mt-2 text-sm text-muted">
          Type your trading day in seconds and confirm before it is saved.
        </p>
      </header>

      <Card className="p-4">
        <SectionTitle title="Demo screen" />
        <p className="text-sm text-muted">
          The quick-entry and natural-language logging flow lands in the next milestone.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill tone="green">Quick entry</Pill>
          <Pill tone="lime">AI parse</Pill>
          <Pill tone="amber">Confirm</Pill>
        </div>
      </Card>
      <BottomNav />
    </div>
  );
}
