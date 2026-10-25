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
      <h2 className="flex items-center gap-2 text-base font-bold text-ink">
        <span
          className="h-4 w-1 rounded-full bg-gradient-to-b from-accent to-brand"
          aria-hidden
        />
        {title}
      </h2>
      {action}
    </div>
  );
}

export function Pill({
  children,
  tone = "brand",
}: Readonly<{
  children: ReactNode;
  tone?: "brand" | "sky" | "amber" | "red" | "gray";
}>) {
  const toneClass =
    tone === "brand"
      ? "bg-mist text-brand"
      : tone === "sky"
        ? "bg-sky/40 text-brand-deep"
        : tone === "amber"
          ? "bg-amber-soft text-amber-ink"
          : tone === "red"
            ? "bg-danger-soft text-danger"
            : "bg-canvas text-muted";
  return (
    <span className={`pill ${toneClass}`}>{children}</span>
  );
}
