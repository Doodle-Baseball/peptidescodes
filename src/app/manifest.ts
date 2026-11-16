import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/data";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  return {
    name: s.site_name,
    short_name: s.site_name,
    description: s.default_meta_description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#081e4c",
    icons: [{ src: "/logo.png", sizes: "512x512", type: "image/png" }],
  };
}
