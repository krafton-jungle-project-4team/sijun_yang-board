# Docker sqldef Schema Drift Verification

Date: 2026-06-16

## Reason

Make `schema.sql` the canonical database schema and add a Docker-only sqldef drift check to local and CI verification.

## Work

- Replaced `init-db.sql` with `apps/api-server/database/schema.sql`.
- Kept seed rows and identity sequence runtime state in `dummy-data.sql`.
- Updated Compose initialization to apply `schema.sql` before `dummy-data.sql`.
- Added API/root `db:verify` scripts using the official `sqldef/psqldef` Docker image with `SQLDEF_IMAGE` override support.
- Added `db:generate` and `db:verify` to root `npm run verify`.
- Kept feature SQL and committed generated PgTyped files under each feature `database/` folder.

## Verification

- `npm run format` passed.
- `npm run db:generate` passed and formats generated PgTyped files.
- `npm run db:verify` passed with `-- Nothing is modified --`.
- `npm run verify` passed with PgTyped generation and Docker sqldef drift verification included.

## Follow-up

- Keep the database running with `npm run dev:db` before invoking verification commands that include `db:verify`.
