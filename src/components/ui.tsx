import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: Readonly<{ children: ReactNode; className?: string }>) {
  return (
    <section className={`card ${className}`}>
      {children}
    </section>
  );
}

export function SectionTitle({
  title,
  action,
}: Readonly<{ title: string; action?: ReactNode }>) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {action}
    </div>
  );
}

export function Pill({
  children,
  tone = "green",
}: Readonly<{ children: ReactNode; tone?: "green" | "amber" | "red" | "gray" | "lime" }>) {
  const toneClass =
    tone === "green"
      ? "bg-mint text-forest"
      : tone === "amber"
        ? "bg-amber-soft text-amber"
        : tone === "red"
          ? "bg-danger-soft text-danger"
          : tone === "lime"
            ? "bg-lime/20 text-forest"
            : "bg-cream text-muted";
  return (
    <span className={`pill ${toneClass}`}>{children}</span>
  );
}
