# API contract

## Public

`GET /api/buildings` returns published building records that satisfy the verified-link and reviewed-provenance query. Public profile routes return `404` for records outside the published collection.

## Submissions

`POST /api/submissions` validates official leasing URL, building name, email, and optional notes with Zod. It creates a `received` submission plus audit event and never publishes.

## Operations

Production operations routes are protected by Auth.js database sessions, Admin/Reviewer roles, and TOTP MFA. Mutations must write an append-only `audit_log` event in the same database transaction.
