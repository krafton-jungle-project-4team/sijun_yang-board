# Query Result Custom Errors

## Reason

Board errors should remain explicit domain errors, but query result helpers also need a way to convert row-count failures into those domain errors without reintroducing assert-style helpers.

## Work

- Added custom error conversion through `get().mapErr(...)` and `getOrNull().mapErr(...)` in the `tx()` query result chain.
- Kept PostgreSQL execution errors unchanged; only query result cardinality failures are converted through the provided factory.
- Moved board not-found handling from `getOrNull()` plus external null checks to `get().mapErr(boardErrorFactory)`.
- Left permission and mutation outcome checks in the board service where they depend on returned SQL columns.

## Verification

- `npm run format` passed.
- `npm run verify` passed.
