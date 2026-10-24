import { BottomNav } from "@/components/bottom-nav";
import { DEMO_BUSINESS_ID } from "@/lib/db/seed";
import { mockFnbSource } from "@/lib/domain/fnb";
import { ImportView } from "./import-view";

export const metadata = {
  title: "Simulated FNB Feed Import — GrowBox",
};

export default function FnbImportPage() {
  const lines = mockFnbSource.fetchStatementLines(DEMO_BUSINESS_ID);

  return (
    <div>
      <ImportView lines={lines} />
      <BottomNav />
    </div>
  );
}
