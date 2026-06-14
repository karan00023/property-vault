"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Building2, Check, ChevronDown, Grid2X2, Heart, List, MapPin, Search, SlidersHorizontal } from "lucide-react";
import type { BuildingSummary as Building } from "@/lib/catalog";

const BuildingMap = dynamic(() => import("./building-map"), { ssr: false, loading: () => <div className="map-loading"><span>Preparing the map</span></div> });

function BuildingCard({ building, index }: { building: Building; index: number }) {
  return (
    <article className="building-card">
      <Link href={`/buildings/${building.slug}`} className={`building-visual tone-${index + 1}`}>
        <span className="verified-pill"><Check size={12} /> Human reviewed</span>
        <span className="visual-monogram">{building.name.split(" ").map((word) => word[0]).join("")}</span>
        <span className="visual-address">{building.address}</span>
        <button className="heart" aria-label={`Save ${building.name}`}><Heart size={17} /></button>
      </Link>
      <div className="card-content">
        <div className="card-location"><MapPin size={13} /> {building.neighborhood} · {building.market}</div>
        <Link href={`/buildings/${building.slug}`}><h3>{building.name}</h3></Link>
        <p>{building.eyebrow}</p>
        <div className="availability-row">
          <span>Availability</span><strong>Confirm with leasing</strong>
        </div>
        <div className="card-footer">
          <span>{building.residenceTypes.length ? building.residenceTypes.join(" · ") : "Unit mix sourcing in progress"}</span>
          <Link href={`/buildings/${building.slug}`} aria-label={`View ${building.name}`}><ArrowRight size={17} /></Link>
        </div>
      </div>
    </article>
  );
}

export function SearchExperience({ buildings }: { buildings: Building[] }) {
  const [query, setQuery] = useState("");
  const [market, setMarket] = useState("All markets");
  const [view, setView] = useState<"grid" | "table">("grid");
  const [mapOpen, setMapOpen] = useState(true);

  const filtered = useMemo(() => buildings.filter((building) => {
    const matchesQuery = `${building.name} ${building.neighborhood} ${building.address}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (market === "All markets" || building.market === market);
  }), [buildings, query, market]);

  return (
    <>
      <section className="search-shell">
        <label className="search-input"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Building, neighborhood, or address" /></label>
        <label className="select-control"><span>Market</span><select value={market} onChange={(event) => setMarket(event.target.value)}><option>All markets</option><option>Manhattan</option><option>Brooklyn</option><option>Jersey City</option></select><ChevronDown size={15} /></label>
        <button className="filter-button"><SlidersHorizontal size={16} /> Filters <span>4</span></button>
        <button className="search-button">Search collection</button>
      </section>

      <section className="collection-bar">
        <div><span className="section-kicker">Curated collection</span><h2>{filtered.length} verified buildings</h2><p>Every published detail links back to its source.</p></div>
        <div className="view-actions">
          <button onClick={() => setMapOpen(!mapOpen)} className={mapOpen ? "active" : ""}><MapPin size={15} /> Map</button>
          <div className="segmented"><button onClick={() => setView("grid")} className={view === "grid" ? "active" : ""}><Grid2X2 size={15} /></button><button onClick={() => setView("table")} className={view === "table" ? "active" : ""}><List size={16} /></button></div>
        </div>
      </section>

      <section className={`results-layout ${mapOpen ? "" : "map-closed"}`}>
        <div className="results-pane">
          {filtered.length === 0 ? <div className="empty-state"><Building2 size={28} /><h3>No reviewed buildings match</h3><p>Broaden the search or submit a building for our sourcing team.</p><button onClick={() => { setQuery(""); setMarket("All markets"); }}>Clear filters</button></div> :
            view === "grid" ? <div className="building-grid">{filtered.map((building, index) => <BuildingCard key={building.slug} building={building} index={index} />)}</div> :
            <div className="building-table">{filtered.map((building) => <Link href={`/buildings/${building.slug}`} key={building.slug}><div><strong>{building.name}</strong><span>{building.address}</span></div><span>{building.market}</span><span>Confirm with leasing</span><ArrowRight size={16} /></Link>)}</div>}
        </div>
        {mapOpen && <aside className="map-pane"><BuildingMap buildings={filtered} /></aside>}
      </section>
    </>
  );
}
