# PropertyVault Handover

## Current state

Milestone 1 production foundations plus the first public website/data slice are implemented locally and ready for a client-owned GitHub repository and staging infrastructure.

Verified locally:

- npm workspace install from lockfile
- unit and policy tests
- TypeScript checks
- lint
- schema validation
- production Next.js build
- desktop and mobile browser inspection
- official seed pipeline for verified building-direct records
- public subpages, sitemap, robots, CSV export, and SEO profile markup

## External access still required

These steps require client-owned accounts or infrastructure and cannot be completed from the current local environment:

1. Create the GitHub repository and add it as `origin`.
2. Configure GitHub environments and secrets for staging.
3. Provision managed PostgreSQL 16 with PostGIS.
4. Run live migration, publication-guard integration test, and rollback against a disposable staging database.
5. Provision transactional email, Vercel web hosting, and worker hosting.
6. Register OAuth credentials and configure production MFA encryption secrets.
7. Purchase the selected domain after trademark and registrar checks.

## Local run

```bash
cp .env.example .env.local
npm install
npm run local:run
```

If Docker is unavailable, use a managed PostGIS database and set `DATABASE_URL`, then run:

```bash
npm run db:migrate
npm run db:seed:official
npm run dev
```

## GitHub publication

After the client-owned empty repository exists:

```bash
git remote add origin <client-owned-repository-url>
git push -u origin main
```

Do not commit `.env` files or replace the client-owned infrastructure model with personal accounts.

## Next milestone

Milestone 2 begins with authoritative seed-source ingestion and must not introduce public inventory until records satisfy the publication gate. Follow `SPEC.md`, `docs/erd.md`, and the original PRD/SOW.
