"use client";

export default function ErrorPage({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <span
        className="flex h-16 w-16 items-center justify-center rounded-3xl bg-mist text-3xl ring-1 ring-sky/60"
        aria-hidden
      >
        ⚠️
      </span>
      <h1 className="text-xl font-extrabold text-ink">Something went wrong</h1>
      <p className="text-sm text-muted">{error.message}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="btn-primary min-h-[44px] rounded-xl px-4 font-semibold text-white"
      >
        Try again
      </button>
    </main>
  );
}
