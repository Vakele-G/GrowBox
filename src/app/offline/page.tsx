import { Card } from "@/components/ui";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Card className="p-6">
        <p className="text-xs font-bold uppercase tracking-wide text-amber">Offline</p>
        <h1 className="mt-2 text-xl font-bold text-ink">You are currently offline</h1>
        <p className="mt-2 text-sm text-muted">
          GrowBox works offline for review and calculations. Changes will sync when your connection is restored.
        </p>
      </Card>
    </div>
  );
}
