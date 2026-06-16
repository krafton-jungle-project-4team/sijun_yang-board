# Board Error Factories

Date: 2026-06-16

## Reason

Restore board feature errors to the existing error-factory style instead of assert-style helpers or inline `AppError` construction.

## Work

- Reintroduced `board-errors.ts` as board-specific error factories.
- Updated board command/query services to throw board error factory results.

## Verification

- `npm run format` passed.
- `npm run verify` passed.
