import { ArrowDown, CheckCircle2, ShieldCheck } from "lucide-react";
import { SearchExperience } from "@/components/search-experience";
import { safeListPublishedBuildings } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { buildings, databaseReady } = await safeListPublishedBuildings();
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="section-kicker light">The building-direct rental index</span>
          <h1>Find the building.<br /><em>Then find your home.</em></h1>
          <p>Discover exceptional rental buildings overlooked by listing portals, with every detail traced to its source and reviewed by a person.</p>
          <div className="trust-row"><span><ShieldCheck size={16} /> Human reviewed</span><span><CheckCircle2 size={16} /> Official leasing links</span><span><ArrowDown size={16} /> Explore below</span></div>
        </div>
        <div className="hero-stamp"><span>PV</span><p>Verified<br />Collection</p></div>
      </section>
      <SearchExperience buildings={buildings} databaseReady={databaseReady} />
      <section className="editorial-band">
        <span className="section-kicker">The PropertyVault standard</span>
        <h2>Fewer listings.<br /><em>Better answers.</em></h2>
        <div className="editorial-points"><p><strong>01</strong> Direct to the source</p><p><strong>02</strong> Reviewed before release</p><p><strong>03</strong> Unknowns shown honestly</p></div>
      </section>
    </main>
  );
}
