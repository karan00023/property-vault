import { notFound } from "next/navigation";
import { SearchExperience } from "@/components/search-experience";
import { safeListPublishedBuildings } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function MarketPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { buildings, databaseReady } = await safeListPublishedBuildings();
  const marketName = slug.replaceAll("-", " ");
  const filtered = buildings.filter((building) => building.market.toLowerCase() === marketName);
  if (databaseReady && buildings.length && !filtered.length) notFound();
  return <main><section className="subpage-hero"><span className="section-kicker light">Market collection</span><h1>{filtered[0]?.market ?? marketName}</h1><p>Reviewed building-direct rental records with source-backed leasing links.</p></section><SearchExperience buildings={filtered} databaseReady={databaseReady} /></main>;
}
