import { BottomNav } from "@/components/bottom-nav";
import { Card, Pill, SectionTitle } from "@/components/ui";

export default function LedgerPlaceholderPage() {
  return (
    <div>
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wide text-leaf">GrowBox</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">Ledger</h1>
        <p className="mt-2 text-sm text-muted">
          Every sale and expense in one place, with daily totals and edit/delete.
        </p>
      </header>

      <Card className="p-4">
        <SectionTitle title="Demo screen" />
        <p className="text-sm text-muted">
          The ledger view lands in the transaction-logging milestone.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill tone="green">Daily totals</Pill>
          <Pill tone="lime">Edit</Pill>
          <Pill tone="amber">Delete</Pill>
        </div>
      </Card>
      <BottomNav />
    </div>
  );
}
