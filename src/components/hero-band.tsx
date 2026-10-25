import type { ReactNode } from "react";

export function HeroBand({
  eyebrow,
  title,
  subtitle,
  action,
}: Readonly<{
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}>) {
  return (
    <header className="hero-band relative p-5">
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-sky">
            {eyebrow}
          </p>
          {action}
        </div>
        <h1 className="mt-2 text-2xl font-extrabold text-white">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-xs leading-relaxed text-sky">{subtitle}</p>
        ) : null}
      </div>
    </header>
  );
}
