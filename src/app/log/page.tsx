import { BottomNav } from "@/components/bottom-nav";
import { LogForm } from "./log-form";

export const metadata = {
  title: "Log Sales & Expenses",
};

export default function LogPage() {
  return (
    <main className="pb-16">
      <LogForm />
      <BottomNav />
    </main>
  );
}
