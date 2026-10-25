import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthGate } from "@/components/auth-gate";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: "GrowBox",
    template: "%s | GrowBox",
  },
  description:
    "GrowBox is a proactive business mentor for South African informal entrepreneurs.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d47a1",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("gb_lang")?.value;
  const isIsiZulu = lang === "zu";

  return (
    <html lang={isIsiZulu ? "zu" : "en"} className={jakarta.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-canvas font-sans text-ink antialiased">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(33_150_243/0.22),transparent_70%)]"
        />
        <div className="relative mx-auto w-full max-w-[520px] px-4 pb-28 pt-4">
          <AuthGate lang={isIsiZulu ? "zu" : "en"}>{children}</AuthGate>
        </div>
        <PwaRegister />
      </body>
    </html>
  );
}
