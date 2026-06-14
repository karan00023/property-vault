DROP TRIGGER IF EXISTS buildings_publication_guard ON buildings;
DROP FUNCTION IF EXISTS propertyvault_publication_guard();
DROP TABLE IF EXISTS building_amenities, recovery_codes, mfa_credentials, authenticators, verification_tokens, sessions, accounts, audit_log, sourcing_tasks, review_items, floor_plans, assets, unit_mix, field_provenance, sources, extraction_jobs, submissions, building_links, buildings, amenities, neighborhoods, markets, users CASCADE;
DROP TYPE IF EXISTS verification_status, user_status, user_role, task_status, task_kind, submission_status, review_type, review_status, link_kind, license_basis, job_status, job_stage, floor_plan_type, building_status, asset_status, asset_kind CASCADE;
