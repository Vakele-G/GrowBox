import Link from "next/link";
import type { Route } from "next";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-3xl bg-mist text-3xl ring-1 ring-sky/60"
        aria-hidden
      >
        🧭
      </span>
      <h1 className="text-xl font-extrabold text-ink">Page not found</h1>
      <p className="text-sm text-muted">GrowBox could not find that page.</p>
      <Link
        href={"/" as Route}
        className="btn-secondary min-h-[44px] rounded-xl px-4 font-semibold"
      >
        Back to Home
      </Link>
    </main>
  );
}
