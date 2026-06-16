import type { IDatabaseConnection, PreparedQuery } from "@pgtyped/runtime";

import { translateDatabaseError } from "./database-errors";

export type PgExecutor = IDatabaseConnection;

type QueryRunner<TParams, TResult> = Pick<PreparedQuery<TParams, TResult>, "run">;

export type QueryResultMethod = "single" | "singleOrNull" | "nonEmpty";
export type QueryErrorConstructor<TError extends Error = Error> = abstract new (...args: never[]) => TError;
export interface QueryErrorPredicateMatcher<TError extends Error = Error> {
    matches: (error: unknown) => error is TError;
}
export type QueryErrorMatcher<TError extends Error = Error> =
    | QueryErrorConstructor<TError>
    | QueryErrorPredicateMatcher<TError>
    | string;
export type QueryErrorFactory<TError extends Error = QueryResultError> = (error: TError) => Error;
export type QueryErrorMapping<TError extends Error = Error> = readonly [
    matcher: QueryErrorMatcher<TError>,
    errorFactory: QueryErrorFactory<TError>
];

export interface QueryResultPromise<TResult> extends Promise<TResult> {
    mapErr: {
        (errorFactory: QueryErrorFactory): QueryResultPromise<TResult>;
        <TError extends Error>(mapping: QueryErrorMapping<TError>): QueryResultPromise<TResult>;
        <TError1 extends Error, TError2 extends Error>(
            mapping1: QueryErrorMapping<TError1>,
            mapping2: QueryErrorMapping<TError2>
        ): QueryResultPromise<TResult>;
        <TError1 extends Error, TError2 extends Error, TError3 extends Error>(
            mapping1: QueryErrorMapping<TError1>,
            mapping2: QueryErrorMapping<TError2>,
            mapping3: QueryErrorMapping<TError3>
        ): QueryResultPromise<TResult>;
        <TError1 extends Error, TError2 extends Error, TError3 extends Error, TError4 extends Error>(
            mapping1: QueryErrorMapping<TError1>,
            mapping2: QueryErrorMapping<TError2>,
            mapping3: QueryErrorMapping<TError3>,
            mapping4: QueryErrorMapping<TError4>
        ): QueryResultPromise<TResult>;
        <
            TError1 extends Error,
            TError2 extends Error,
            TError3 extends Error,
            TError4 extends Error,
            TError5 extends Error
        >(
            mapping1: QueryErrorMapping<TError1>,
            mapping2: QueryErrorMapping<TError2>,
            mapping3: QueryErrorMapping<TError3>,
            mapping4: QueryErrorMapping<TError4>,
            mapping5: QueryErrorMapping<TError5>
        ): QueryResultPromise<TResult>;
    };
}

interface QueryResult<TResult> {
    multiple: () => QueryResultPromise<TResult[]>;
    nonEmpty: () => QueryResultPromise<TResult[]>;
    single: () => QueryResultPromise<TResult>;
    singleOrNull: () => QueryResultPromise<TResult | null>;
}

export interface TxDb {
    query: <TParams, TResult>(query: QueryRunner<TParams, TResult>, params: TParams) => QueryResult<TResult>;
}

type NormalizedQueryErrorMapping = readonly [matcher: QueryErrorMatcher, errorFactory: (error: Error) => Error];

const txDbExecutor = Symbol("TxDb.executor");

interface TxDbWithExecutor extends TxDb {
    [txDbExecutor]: PgExecutor;
}

export function createTxDb(executor: PgExecutor): TxDb {
    const db: TxDbWithExecutor = {
        [txDbExecutor]: executor,
        query: (query, params) => createQueryResult(query, params, executor)
    };

    return db;
}

export function getTxDbExecutor(db: TxDb): PgExecutor {
    const executor = (db as Partial<TxDbWithExecutor>)[txDbExecutor];

    if (!executor) {
        throw new Error("TxDb executor is not available.");
    }

    return executor;
}

function createQueryResult<TParams, TResult>(
    query: QueryRunner<TParams, TResult>,
    params: TParams,
    executor: PgExecutor
): QueryResult<TResult> {
    const multiple = () => createQueryResultPromise(() => query.run(params, executor));
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
    const promise = callback().catch((error) => {
        throw translateDatabaseError(error);
    }) as QueryResultPromise<TResult>;

    promise.mapErr = ((...args: [QueryErrorFactory] | QueryErrorMapping[]) => {
        const mappings = normalizeErrorMappings(args);

        return createQueryResultPromise(async () => {
            try {
                return await promise;
            } catch (error) {
                const mappedError = getMappedError(error, mappings);

                if (mappedError) {
                    throw mappedError;
                }

                throw error;
            }
        });
    }) as QueryResultPromise<TResult>["mapErr"];

    return promise;
}

function normalizeErrorMappings(args: [QueryErrorFactory] | QueryErrorMapping[]): NormalizedQueryErrorMapping[] {
    const [firstArg] = args;

    if (typeof firstArg === "function") {
        return [[QueryResultError, firstArg as unknown as (error: Error) => Error]];
    }

    return args as unknown as NormalizedQueryErrorMapping[];
}

function getMappedError(error: unknown, mappings: NormalizedQueryErrorMapping[]) {
    for (const [matcher, errorFactory] of mappings) {
        if (matchesError(error, matcher)) {
            return errorFactory(error as Error);
        }
    }

    return null;
}

function matchesError(error: unknown, matcher: QueryErrorMatcher) {
    if (typeof matcher === "string") {
        return getErrorName(error) === matcher;
    }

    if ("matches" in matcher) {
        return matcher.matches(error);
    }

    return error instanceof matcher;
}

function getErrorName(error: unknown) {
    if (error instanceof Error) {
        return error.name;
    }

    return typeof error;
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
