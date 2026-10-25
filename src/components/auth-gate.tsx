"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/db/client";
import { getMessages } from "@/lib/messages";
import type { Language } from "@/lib/domain/types";

/** Routes anyone may open without a session. */
const PUBLIC_PATHS = ["/login", "/offline"];

/**
 * Sits in the root layout so the shared link lands on /login: every other
 * route waits for a Supabase session before rendering its content, and
 * bounces signed-out visitors to the demo sign-in screen.
 *
 * The session lives in localStorage (browser-side Supabase auth), so the
 * check has to run client-side — a server check would never see it. Until it
 * resolves, this renders only its loading state, both during SSR and after
 * hydration, so no app content ever flashes first.
 *
 * Note this is a presentation gate for the demo, not a security boundary:
 * the dataset is shared demo data and server actions stay reachable.
 */
export function AuthGate({
  children,
  lang = "en",
}: Readonly<{ children: ReactNode; lang?: Language }>) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const isPublic = PUBLIC_PATHS.includes(pathname);
  const [ready, setReady] = useState(isPublic);
  const messages = getMessages(lang);

  useEffect(() => {
    if (isPublic) return;

    let cancelled = false;
    const supabase = createBrowserSupabaseClient();

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data.session) {
          router.replace("/login");
          return;
        }
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      });

    return () => {
      cancelled = true;
    };
  }, [isPublic, router]);

  if (!ready) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
        <span
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mist text-2xl ring-1 ring-sky/60"
          aria-hidden
        >
          📦
        </span>
        <p className="text-xs font-bold uppercase tracking-wide text-brand">
          GrowBox
        </p>
        <p className="text-sm text-muted">{messages.common.loading}</p>
      </main>
    );
  }

  return <>{children}</>;
}
