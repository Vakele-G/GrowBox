import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

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
  themeColor: "#0b5d3b",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("gb_lang")?.value;
  const isIsiZulu = lang === "zu";

  return (
    <html lang={isIsiZulu ? "zu" : "en"} suppressHydrationWarning>
      <body className="min-h-dvh bg-cream font-sans text-ink antialiased">
        <div className="mx-auto w-full max-w-[520px] px-4 pb-28 pt-4">{children}</div>
        <PwaRegister />
      </body>
    </html>
  );
}
