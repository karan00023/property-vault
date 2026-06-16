import type { MetadataRoute } from "next";
import { safeListPublishedBuildings } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { buildings } = await safeListPublishedBuildings();
  return [
    "", "/markets", "/coverage", "/data-standard", "/about", "/submit",
    ...buildings.map((building) => `/buildings/${building.slug}`)
  ].map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));
}
