import { sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Activity, ClipboardList, Database, FileSearch, ShieldCheck } from "lucide-react";
import { auditLog, buildings, createDatabase, extractionJobs, reviewItems, sourcingTasks } from "@propertyvault/db";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

async function loadOperations() {
  const { db, client } = createDatabase();
  try {
    const [published] = await db.select({ count: sql<number>`count(*)::int` }).from(buildings).where(sql`${buildings.status} = 'published'`);
    const [reviews] = await db.select({ count: sql<number>`count(*)::int` }).from(reviewItems).where(sql`${reviewItems.status} in ('open','in_progress')`);
    const [jobs] = await db.select({ count: sql<number>`count(*)::int` }).from(extractionJobs).where(sql`${extractionJobs.status} in ('queued','running')`);
    return {
      published: published.count, reviews: reviews.count, activeJobs: jobs.count,
      tasks: await db.select().from(sourcingTasks).orderBy(sql`${sourcingTasks.createdAt} desc`).limit(8),
      audit: await db.select().from(auditLog).orderBy(sql`${auditLog.createdAt} desc`).limit(8)
    };
  } finally {
    await client.end();
  }
}

export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");
  if (!["admin", "reviewer"].includes(session.user.role)) redirect("/");
  if (!session.user.mfaVerified) redirect("/auth/mfa");
  const operations = await loadOperations();
  return <main className="admin-page">
    <section className="admin-heading"><div><span className="section-kicker">PropertyVault operations</span><h1>Review desk</h1><p>Live workflow data. Nothing reaches the public collection without an accountable human decision.</p></div></section>
    <section className="metrics">
      <article><ShieldCheck /><span>Published collection</span><strong>{operations.published}</strong><small>Database-backed</small></article>
      <article><ClipboardList /><span>Awaiting review</span><strong>{operations.reviews}</strong><small>Open and in progress</small></article>
      <article><Activity /><span>Active jobs</span><strong>{operations.activeJobs}</strong><small>Queued and running</small></article>
      <article><Database /><span>System of record</span><strong>PostGIS</strong><small>No static inventory</small></article>
    </section>
    <section className="admin-grid">
      <div className="queue-panel"><div className="panel-heading"><div><span className="section-kicker">Sourcing board</span><h2>Open research tasks</h2></div></div>
        <div className="task-list">{operations.tasks.length ? operations.tasks.map((task) => <div className="task-row" key={task.id}><span className="task-icon"><FileSearch size={17} /></span><span><strong>{task.kind.replaceAll("_", " ")}</strong><small>{task.status} · {task.urlsChecked.length} URLs checked</small></span></div>) : <p className="admin-empty">No sourcing tasks yet.</p>}</div>
      </div>
      <aside className="audit-panel"><div className="panel-heading"><div><span className="section-kicker">Audit log</span><h2>Recent decisions</h2></div></div>
        <div className="audit-list">{operations.audit.length ? operations.audit.map((event) => <div key={event.id}><Database /><p><strong>{event.action}</strong><span>{event.entityType} · {event.createdAt.toISOString()}</span></p></div>) : <p className="admin-empty">No audit events yet.</p>}</div>
      </aside>
    </section>
  </main>;
}
