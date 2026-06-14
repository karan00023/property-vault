import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CalendarClock, Check, ExternalLink, FileSearch, ShieldCheck } from "lucide-react";
import { getPublishedBuilding } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function BuildingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const building = await getPublishedBuilding(slug);
  if (!building) notFound();
  const fetched = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(building.provenance.fetchedAt));

  return (
    <main className="profile-page">
      <section className="profile-hero">
        <Link href="/" className="back-link"><ArrowLeft size={15} /> Back to collection</Link>
        <div className="profile-heading">
          <div><span className="section-kicker light">{building.neighborhood} · {building.market}</span><h1>{building.name}</h1><p>{building.eyebrow}</p></div>
          <div className="profile-actions"><a href={building.leasingUrl} target="_blank" rel="noreferrer" className="primary-cta">Visit official leasing <ArrowUpRight size={17} /></a><span><Check size={13} /> Link verified {fetched}</span></div>
        </div>
        <div className="profile-art"><div className="profile-monogram">{building.name.split(" ").map((word) => word[0]).join("")}</div><span>No licensed photography published yet</span></div>
      </section>

      <nav className="profile-nav"><a href="#overview">Overview</a><a href="#residences">Residences</a><a href="#floorplans">Floor plans</a><a href="#provenance">Sources</a></nav>
      <section className="profile-content" id="overview">
        <div className="profile-main">
          <span className="section-kicker">The building</span><h2>{building.eyebrow}</h2><p className="lead">{building.description}</p>
          <div className="attribute-grid">{building.attributes.map((attribute) => <span key={attribute}><Check size={14} /> {attribute}</span>)}</div>
        </div>
        <aside className="fact-card"><span className="section-kicker">At a glance</span><dl><div><dt>Address</dt><dd>{building.address}</dd></div><div><dt>Availability</dt><dd>Confirm with official leasing</dd></div><div><dt>Review status</dt><dd><span className="status-approved">Human approved</span></dd></div></dl></aside>
      </section>

      <section className="residence-section" id="residences"><span className="section-kicker">Residence mix</span><h2>Known residence types</h2>{building.residenceTypes.length ? <div className="residence-types">{building.residenceTypes.map((type) => <div key={type}><strong>{type}</strong><span>Rent band not yet sourced</span></div>)}</div> : <div className="sourcing-state"><FileSearch size={24} /><h3>Unit mix sourcing in progress</h3><p>We will publish these details only after a human reviewer confirms the official source.</p></div>}</section>
      <section className="floorplan-section" id="floorplans"><div><span className="section-kicker light">Floor plan library</span><h2>Not yet available</h2><p>PropertyVault publishes only official PDFs, licensed images, or verified SightMap / Engrain embeds. The sourcing team is working on this collection.</p></div><CalendarClock size={34} /></section>
      <section className="provenance-section" id="provenance"><span className="section-kicker">Source record</span><h2>Why you can trust this page</h2><div className="source-card"><ShieldCheck size={24} /><div><strong>{building.provenance.sourceLabel}</strong><a href={building.provenance.sourceUrl} target="_blank" rel="noreferrer">{building.provenance.sourceUrl} <ExternalLink size={13} /></a></div><div><span>Confidence</span><strong>{building.provenance.confidence}</strong></div><div><span>Last fetched</span><strong>{fetched}</strong></div></div></section>
    </main>
  );
}
