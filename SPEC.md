# PropertyVault Production Specification

PropertyVault is a building-first luxury rental index for Manhattan, Brooklyn, and Downtown Jersey City. This repository is a greenfield production rebuild governed by `PropertyVault_PRD_SOW_v1.docx` and `CODEX_BRIEF.md`.

## Non-negotiable product rules

1. Never fabricate rents, availability, unit counts, photos, floor plans, sources, reviewers, audit events, or operational metrics.
2. Every persisted public data value requires source URL, fetch time, confidence, and human-review state.
3. Machine extraction may create staged review candidates. It cannot publish.
4. Public queries return `published` buildings only.
5. Missing assets and fields are explicit states with sourcing tasks, not generated substitutes.
6. Crawlers must respect robots.txt, site terms, domain blocks, and per-domain throttles.
7. PostgreSQL/PostGIS is the system of record. Static files and browser storage are never databases.

## Milestone 1 acceptance

- npm workspace with `apps/web`, `apps/worker`, `packages/db`, `packages/config`, and `packages/ui`
- complete Section 8 canonical schema and reversible migrations
- PostGIS point/polygon fields and spatial indexes
- Auth.js foundation with database users, roles, MFA enrollment/challenge, and recovery codes
- admin routes protected by role and MFA state
- worker package with queue contracts and health entrypoint
- CI runs lint, typecheck, tests, migration validation, and build
- no static preview inventory or fabricated operations data
- architecture, ERD, environment, deployment, and demo documentation

## Publication gate

A building may publish only when it has:

- normalized address and successful geocode inside a covered market
- reviewed, verified leasing link with successful HTTP status
- reviewed provenance for name, neighborhood, floors, and geometry
- an accountable reviewer decision and audit event

The database enforces the minimum gate; service-layer transactions enforce the full review workflow.
