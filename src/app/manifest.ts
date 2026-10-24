import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "GrowBox - grow a bankable business",
    short_name: "GrowBox",
    description:
      "A proactive business mentor for South African informal entrepreneurs. Cost it, price it, log it, grow it.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f0",
    theme_color: "#0b5d3b",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
