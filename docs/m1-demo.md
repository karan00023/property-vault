# Milestone 1 Demo

1. Start PostGIS and Mailpit: `docker compose up -d db mail`.
2. Apply the baseline: `npm run db:migrate`.
3. Run `npm run db:seed:official`.
4. Run `npm run db:validate`, `npm test`, `npm run typecheck`, and `npm run build`.
5. Open the public app and confirm the reviewed collection is populated from PostGIS, not static files.
5. Sign in through Auth.js, enroll TOTP through `/api/auth/mfa/enroll`, verify through `/api/auth/mfa/verify`, then reauthenticate.
6. Open `/admin` and confirm metrics, sourcing tasks, and audit events come from PostgreSQL.
7. Run `npm run dev:worker` and confirm the worker reports ready.
8. Run `npm run db:rollback` against a disposable database to prove reversibility.
