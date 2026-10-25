"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/",
    label: "Home",
    match: (path: string) => path === "/",
    icon: (
      <>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 22V12h6v10" />
      </>
    ),
  },
  {
    href: "/log",
    label: "Log",
    match: (path: string) => path.startsWith("/log"),
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v8M8 12h8" />
      </>
    ),
  },
  {
    href: "/ledger",
    label: "Ledger",
    match: (path: string) => path.startsWith("/ledger"),
    icon: (
      <>
        <path d="M8 6h13M8 12h13M8 18h13" />
        <path d="M3 6h.01M3 12h.01M3 18h.01" />
      </>
    ),
  },
  {
    href: "/dashboard",
    label: "Grow",
    match: (path: string) => path.startsWith("/dashboard"),
    icon: (
      <>
        <path d="m22 7-8.5 8.5-5-5L2 17" />
        <path d="M16 7h6v6" />
      </>
    ),
  },
  {
    href: "/health",
    label: "Health",
    match: (path: string) => path.startsWith("/health"),
    icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  },
] as const;

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="mx-3 mb-2 flex items-stretch justify-around rounded-2xl border border-line bg-paper/90 px-1 py-1 pb-[max(env(safe-area-inset-bottom),0px)] shadow-float backdrop-blur">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-[11px] font-semibold transition-colors active:scale-95 ${
                active ? "bg-mist text-brand" : "text-muted hover:text-brand"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {item.icon}
              </svg>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
