import { createQueryPromise, type QueryPromise } from "./query-error";
import type { QueryExecutor, QueryRunner } from "./query-executor";

export type QueryResultMethod = "single" | "singleOrNull" | "nonEmpty";

export type QueryResultPromise<TResult> = QueryPromise<TResult, QueryResultError>;

export interface QueryResult<TResult> {
    multiple: () => QueryResultPromise<TResult[]>;
    nonEmpty: () => QueryResultPromise<TResult[]>;
    single: () => QueryResultPromise<TResult>;
    singleOrNull: () => QueryResultPromise<TResult | null>;
}

export interface QueryResultDb extends QueryExecutor {
    query: <TParams, TResult>(query: QueryRunner<TParams, TResult>, params: TParams) => QueryResult<TResult>;
}

export function withQueryResultApi<TDb extends QueryExecutor>(db: TDb): TDb & QueryResultDb {
    return Object.assign(db, {
        query: <TParams, TResult>(query: QueryRunner<TParams, TResult>, params: TParams) =>
            createQueryResult(db, query, params)
    });
}

export function createQueryResult<TParams, TResult>(
    db: QueryExecutor,
    query: QueryRunner<TParams, TResult>,
    params: TParams
): QueryResult<TResult> {
    const multiple = () => createQueryResultPromise(() => db.execute(query, params));
    const nonEmpty = () =>
        createQueryResultPromise(async () => {
            const rows = await multiple();

            if (rows.length === 0) {
                throw new QueryResultError("nonEmpty", rows.length);
            }

            return rows;
        });
    const singleOrNull = () =>
        createQueryResultPromise(async () => {
            const rows = await multiple();

            if (rows.length > 1) {
                throw new QueryResultError("singleOrNull", rows.length);
            }

            return rows[0] ?? null;
        });
    const single = () =>
        createQueryResultPromise(async () => {
            const rows = await multiple();

            if (rows.length !== 1) {
                throw new QueryResultError("single", rows.length);
            }

            return rows[0] as TResult;
        });

    return {
        multiple,
        nonEmpty,
        single,
        singleOrNull
    };
}

/**
 * QueryResult 편의 API에서 발생한 row 개수 불일치를 나타낸다.
 *
 * single, singleOrNull, nonEmpty가 PgTyped에서 예상과 다른 row 개수를 받았을 때 사용한다.
 * query error mapping이 정확한 진단 정보를 남길 수 있도록 method와 row count 필드를 보존한다.
 */
export class QueryResultError extends Error {
    constructor(
        public readonly method: QueryResultMethod,
        public readonly rowCount: number
    ) {
        super(getQueryResultErrorMessage(method, rowCount));
        this.name = "QueryResultError";
    }
}

function createQueryResultPromise<TResult>(callback: () => Promise<TResult>): QueryResultPromise<TResult> {
    return createQueryPromise(callback, { defaultMapErrMatcher: QueryResultError });
}

function getQueryResultErrorMessage(method: QueryResultMethod, rowCount: number) {
    if (method === "singleOrNull") {
        return `Expected zero or one row, got ${rowCount}.`;
    }

    if (method === "nonEmpty") {
        return `Expected at least one row, got ${rowCount}.`;
    }

    return `Expected one row, got ${rowCount}.`;
}
