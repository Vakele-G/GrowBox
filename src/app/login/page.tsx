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
    <main className="flex min-h-dvh flex-col justify-center gap-4 px-6">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-wide text-leaf">GrowBox</p>
        <h1 className="mt-1 text-2xl font-bold text-ink">{messages.auth.title}</h1>
        <p className="mt-2 text-sm text-muted">{messages.auth.subtitle}</p>
      </div>

      <button
        type="button"
        onClick={handleDemoSignIn}
        disabled={busy}
        className="btn-primary min-h-[44px] w-full rounded-xl px-4 font-semibold text-white disabled:opacity-55"
      >
        {busy ? messages.common.signingIn : messages.auth.demoButton}
      </button>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <p className="text-center text-xs text-muted">{messages.auth.demoHint}</p>
    </main>
  );
}

export default function LoginPage() {
  return <LoginForm />;
}
