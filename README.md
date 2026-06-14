# PropertyVault

PropertyVault is a production-grade, building-direct luxury rental index for Manhattan, Brooklyn, and Downtown Jersey City. PostgreSQL/PostGIS is the only catalog system of record, and every public field requires provenance plus human review.

## Workspace

- `apps/web`: Next.js public and operations application
- `apps/worker`: pg-boss queue worker boundary
- `packages/db`: canonical Drizzle schema and reversible migrations
- `packages/config`: shared strict configuration
- `packages/ui`: shared product language/design primitives

## Local setup

```bash
cp .env.example .env.local
docker compose up -d db mail
npm install
npm run db:migrate
npm test
npm run dev
```

Mailpit is available at `http://localhost:8025`. The public catalog is empty until reviewed records satisfy the database publication gate; there is intentionally no static fallback.

## Governing documents

- [SPEC.md](SPEC.md)
- [ERD](docs/erd.md)
- [M1 acceptance](docs/m1-acceptance.md)
- [Architecture](docs/architecture.md)
- [Runbook](docs/runbook.md)
- [Handover](HANDOVER.md)
