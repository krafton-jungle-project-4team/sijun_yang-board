# PgTyped CLS Transactions

Date: 2026-06-16

## Reason

Move API database transaction management from the manual `tx(async db => ...)` callback helper to a CLS-propagated transaction host while preserving PgTyped as the only application query path.

## Work

- Added `nestjs-cls` and `@nestjs-cls/transactional`.
- Added a repo-local PgTyped adapter that wraps `pg.Pool` transactions, exposes `TxDb`, and uses savepoints for nested propagation.
- Refactored `TxDb` creation so query helpers work with both pool-backed fallback execution and transaction clients.
- Split query result helpers into `single`, `singleOrNull`, `multiple`, and `nonEmpty`.
- Migrated auth and board services to `@Transactional()` with injected `Transaction<PgTypedTransactionalAdapter>`.
- Extended `mapErr` to support ordered error mappings for abstract database errors.
- Added Spring-inspired PostgreSQL SQLSTATE wrappers and abstract database error classes in `database-errors.ts`, with source links and constraint metadata matching.
- Changed board not-found paths to use `singleOrNull()` instead of mapping `QueryResultError` in service code.
- Added a global database fallback error factory that hides implementation-specific database errors from API responses while preserving the cause internally.
- Minimized the legacy `tx()` helper so it only delegates to `TransactionHost.withTransaction()`.
- Added focused adapter and query-helper tests to the API test script and root verification flow.

## Verification

- `npm run test --workspace @nmm/api-server` passed.
- `npm run verify` passed.
