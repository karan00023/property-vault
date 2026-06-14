# Handover runbook

## Release

1. CI must pass lint, typecheck, and production build.
2. Apply generated Drizzle migrations before the web deployment.
3. Run smoke checks for search, profile SSR, official CTA links, submission, and admin authentication.
4. Confirm the public catalog query returns `status = published` records only.

## Review workflow

1. Ingestion or submission creates a candidate and sourcing tasks.
2. Researcher validates official sources and adds field-level provenance.
3. Reviewer verifies licensing, confidence, and stale-data risk.
4. Reviewer approves the building in the same transaction that records the audit event.
5. A scheduled freshness job creates tasks for aging source records.

## Incident controls

To unpublish, set `buildings.status = 'archived'` and record the action in `audit_log`. Never delete provenance or audit records during an incident. Rotate compromised credentials and invalidate affected sessions.
