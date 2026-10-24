"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home", match: (path: string) => path === "/" },
  { href: "/log", label: "Log", match: (path: string) => path.startsWith("/log") },
  { href: "/ledger", label: "Ledger", match: (path: string) => path.startsWith("/ledger") },
  { href: "/dashboard", label: "Grow", match: (path: string) => path.startsWith("/dashboard") },
  { href: "/health", label: "Health", match: (path: string) => path.startsWith("/health") },
] as const;

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-[520px] items-stretch justify-around px-2 pb-[max(env(safe-area-inset-bottom),0px)] pt-2">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[48px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-xs font-semibold ${
                active ? "text-forest" : "text-muted"
              }`}
            >
              <span>{item.label}</span>
              {active ? <span className="h-1 w-1 rounded-full bg-leaf" /> : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
