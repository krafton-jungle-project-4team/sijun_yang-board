import { translateDatabaseError } from "./database-errors";
import { createQueryExecutor, getQueryExecutorPgExecutor, type PgExecutor, type QueryExecutor } from "./query-executor";
import { withQueryResultApi, type QueryResultDb } from "./query-result";

export type TxDb = QueryExecutor & QueryResultDb;

export function createTxDb(executor: PgExecutor): TxDb {
    return withQueryResultApi(createQueryExecutor(executor, { translateError: translateDatabaseError }));
}

export function getTxDbExecutor(db: TxDb): PgExecutor {
    return getQueryExecutorPgExecutor(db);
}

export type { PgExecutor, QueryExecutor } from "./query-executor";
export type { QueryResult, QueryResultDb, QueryResultMethod, QueryResultPromise } from "./query-result";
export { QueryResultError } from "./query-result";
