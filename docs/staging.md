# Staging Setup

Create all accounts under client ownership:

1. Managed PostgreSQL 16 with PostGIS and point-in-time recovery.
2. Vercel project for `apps/web`.
3. Fly.io/Railway service for `apps/worker`.
4. Transactional email provider for Auth.js magic links.
5. Separate staging secrets for database, Auth.js, MFA encryption, and OAuth.

The staging workflow runs tests/build and applies migrations before the deployment handoff. Never share production databases, encryption keys, or OAuth applications with staging.
