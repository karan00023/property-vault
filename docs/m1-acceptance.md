# Milestone 1 Acceptance Checklist

- [x] Workspace installs from lockfile
- [x] Database schema matches `docs/erd.md`
- [ ] Baseline migration applies to empty PostGIS database
- [ ] Migration rollback succeeds
- [x] Publication guard policy exists and is covered by migration-policy tests
- [x] Provenance constraints reject missing source/confidence
- [x] Admin route rejects anonymous, non-admin, and non-MFA sessions
- [ ] Worker health command connects to queue/database
- [x] Lint, typecheck, unit tests, schema validation, and production build pass
- [x] No public data fallback, static inventory, or fabricated admin metrics remain
- [x] Staging deployment variables and runbook documented

Live migration/rollback, worker health, and database integration checks remain pending because this workstation has no Docker or PostgreSQL server. CI executes them against `postgis/postgis:16-3.4`.
