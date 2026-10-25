"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { signInDemo } from "@/lib/auth";
import type { DemoSignInResult } from "@/lib/auth-types";
import { getMessages } from "@/lib/messages";
import type { Language } from "@/lib/domain/types";

export function LoginForm({ lang = "en" }: Readonly<{ lang?: Language }>) {
  const router = useRouter();
  const messages = getMessages(lang);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDemoSignIn() {
    setBusy(true);
    setError(null);
    const result: DemoSignInResult = await signInDemo();
    if (!result.ok || !result.hashedToken || !result.verificationType) {
      setError(result.error ?? messages.common.error);
      setBusy(false);
      return;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      {
        auth: { persistSession: true, autoRefreshToken: true },
      },
    );
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: result.hashedToken,
      type: result.verificationType,
    });

    if (verifyError) {
      setError(verifyError.message);
      setBusy(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="hero-band -mx-4 -mt-4 flex min-h-dvh flex-col justify-center gap-5 rounded-none px-6">
      <div className="relative z-10 text-center">
        <span
          className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl ring-1 ring-white/25"
          aria-hidden
        >
          📦
        </span>
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-white">
          GrowBox
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-white">{messages.auth.title}</h1>
        <p className="mt-2 text-sm text-white">{messages.auth.subtitle}</p>
      </div>

      <div className="relative z-10 space-y-3">
        <button
          type="button"
          onClick={handleDemoSignIn}
          disabled={busy}
          className="w-full rounded-xl bg-white px-4 py-3 font-bold text-brand shadow-float transition-transform active:scale-[0.98] disabled:opacity-60"
        >
          {busy ? messages.common.signingIn : messages.auth.demoButton}
        </button>

        {error ? <p className="text-sm font-semibold text-white">⚠ {error}</p> : null}

        <p className="text-center text-xs text-white">{messages.auth.demoHint}</p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
