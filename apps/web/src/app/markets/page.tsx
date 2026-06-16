import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { safeListPublishedBuildings } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function MarketsPage() {
  const { buildings, databaseReady } = await safeListPublishedBuildings();
  const markets = Array.from(new Set(buildings.map((building) => building.market)));
  return <main className="subpage"><section className="subpage-hero"><span className="section-kicker light">Launch markets</span><h1>Verified coverage, market by market.</h1><p>PropertyVault starts with building-direct luxury rentals in Manhattan, Brooklyn, and Downtown Jersey City.</p></section><section className="market-grid">{markets.length ? markets.map((market) => { const count = buildings.filter((building) => building.market === market).length; return <Link href={`/markets/${market.toLowerCase().replaceAll(" ", "-")}`} key={market}><MapPin /><strong>{market}</strong><span>{count} reviewed buildings</span><ArrowRight /></Link>; }) : <div className="empty-state"><h3>{databaseReady ? "No published markets yet" : "Connect PostGIS to load markets"}</h3><p>Run the official seed after migrations to publish verified records.</p></div>}</section></main>;
}
