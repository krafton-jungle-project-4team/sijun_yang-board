import type { IDatabaseConnection } from "@pgtyped/runtime";
import { Propagation, TransactionHost } from "@nestjs-cls/transactional";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DatabaseError, type Pool, type PoolClient } from "pg";

import { AppError } from "../src/app-errors";
import {
    databaseErrors,
    databaseFallbackError,
    DatabaseUnknownError,
    pgErrors
} from "../src/infra/database/database-errors";
import { PgTypedTransactionalAdapter } from "../src/infra/database/pgtyped-transactional.adapter";
import { createQueryExecutor } from "../src/infra/database/query-executor";
import { withQueryResultApi } from "../src/infra/database/query-result";
import { createTxDb, QueryResultError, type TxDb } from "../src/infra/database/tx";
import { tx } from "../src/infra/database/tx-compat";

interface QueryCall {
    text: string;
    bindings: unknown[];
}

interface TestRow {
    id: number;
}

class FakeExecutor implements IDatabaseConnection {
    readonly calls: QueryCall[] = [];

    private readonly resultQueue: unknown[][] = [];

    queueRows(...rowsByCall: unknown[][]) {
        this.resultQueue.push(...rowsByCall);
    }

    async query(text: string, bindings: unknown[] = []) {
        this.calls.push({ text, bindings });

        if (isTransactionControlStatement(text)) {
            return { rows: [], rowCount: 0 };
        }

        const rows = this.resultQueue.shift() ?? [];
        return { rows, rowCount: rows.length };
    }
}

class FakeClient extends FakeExecutor {
    released = false;

    release() {
        this.released = true;
    }
}

class FakePool extends FakeExecutor {
    readonly clients: FakeClient[] = [];

    async connect() {
        const client = new FakeClient();
        this.clients.push(client);

        return client as unknown as PoolClient;
    }
}

class ExternalQueryError extends Error {
    constructor() {
        super("external query failed");
        this.name = "ExternalQueryError";
    }
}

class OtherQueryError extends Error {
    constructor() {
        super("other query failed");
        this.name = "OtherQueryError";
    }
}

const selectRowsQuery = {
    run: async (_params: undefined, db: IDatabaseConnection) => {
        const result = await db.query("SELECT rows", []);
        return result.rows as TestRow[];
    }
};

describe("PgTypedTransactionalAdapter", () => {
    it("commits successful transactions and releases the client", async () => {
        const pool = new FakePool();
        const { wrapWithTransaction } = createAdapterOptions(pool);
        let db: TxDb | undefined;

        const result = await wrapWithTransaction(
            {},
            async () => {
                assert.ok(db);
                await db.query(selectRowsQuery, undefined).multiple();
                return "committed";
            },
            (nextDb) => {
                db = nextDb;
            }
        );

        assert.equal(result, "committed");
        assert.deepEqual(getStatements(pool.clients[0]), ["BEGIN", "SELECT rows", "COMMIT"]);
        assert.equal(pool.clients[0]?.released, true);
    });

    it("rolls back failed transactions and releases the client", async () => {
        const pool = new FakePool();
        const { wrapWithTransaction } = createAdapterOptions(pool);

        await assert.rejects(
            wrapWithTransaction(
                {},
                async () => {
                    throw new Error("boom");
                },
                () => undefined
            ),
            /boom/
        );

        assert.deepEqual(getStatements(pool.clients[0]), ["BEGIN", "ROLLBACK"]);
        assert.equal(pool.clients[0]?.released, true);
    });

    it("reuses the current transaction for Required propagation", async () => {
        const pool = new FakePool();
        const txHost = createTransactionHost(pool);

        await txHost.withTransaction(async () => {
            const outerDb = txHost.tx;

            await txHost.withTransaction(async () => {
                assert.equal(txHost.tx, outerDb);
                await txHost.tx.query(selectRowsQuery, undefined).multiple();
            });
        });

        assert.equal(pool.clients.length, 1);
        assert.deepEqual(getStatements(pool.clients[0]), ["BEGIN", "SELECT rows", "COMMIT"]);
    });

    it("uses the pool-backed fallback outside a transaction", async () => {
        const pool = new FakePool();
        const txHost = createTransactionHost(pool);

        await txHost.tx.query(selectRowsQuery, undefined).multiple();

        assert.equal(pool.clients.length, 0);
        assert.deepEqual(getStatements(pool), ["SELECT rows"]);
    });

    it("preserves query helper behavior for pool and transaction executors", async () => {
        for (const executor of [new FakePool(), new FakeClient()]) {
            executor.queueRows([{ id: 1 }], [], [{ id: 1 }, { id: 2 }], [], [{ id: 1 }, { id: 2 }]);
            const db = createTxDb(executor);

            assert.deepEqual(await db.query(selectRowsQuery, undefined).single(), { id: 1 });
            assert.equal(await db.query(selectRowsQuery, undefined).singleOrNull(), null);

            await assert.rejects(
                db
                    .query(selectRowsQuery, undefined)
                    .singleOrNull()
                    .mapErr((error) => new Error(`mapped ${error.method}:${error.rowCount}`)),
                /mapped singleOrNull:2/
            );
            await assert.rejects(db.query(selectRowsQuery, undefined).single(), QueryResultError);
            assert.deepEqual(await db.query(selectRowsQuery, undefined).multiple(), [{ id: 1 }, { id: 2 }]);
        }
    });

    it("supports empty and non-empty multiple result handling", async () => {
        const executor = new FakePool();
        const db = createTxDb(executor);

        executor.queueRows([], [], [{ id: 1 }, { id: 2 }]);

        assert.deepEqual(await db.query(selectRowsQuery, undefined).multiple(), []);
        await assert.rejects(
            db
                .query(selectRowsQuery, undefined)
                .nonEmpty()
                .mapErr([QueryResultError, (error) => new Error(`mapped ${error.method}:${error.rowCount}`)]),
            /mapped nonEmpty:0/
        );
        assert.deepEqual(await db.query(selectRowsQuery, undefined).nonEmpty(), [{ id: 1 }, { id: 2 }]);
    });

    it("builds cardinality helpers from the public query executor API", async () => {
        const executor = new FakePool();
        const db = withQueryResultApi(createQueryExecutor(executor));

        executor.queueRows([{ id: 1 }]);

        assert.deepEqual(await db.query(selectRowsQuery, undefined).single(), { id: 1 });
    });

    it("allows mapErr on multiple for execution errors", async () => {
        const db = createTxDb(new FakePool());

        await assert.rejects(
            db
                .query(createThrowingQuery(new ExternalQueryError()), undefined)
                .multiple()
                .mapErr([ExternalQueryError, () => new Error("mapped multiple error")]),
            /mapped multiple error/
        );
    });

    it("keeps low-level PostgreSQL error matchers for SQLSTATE and constraint metadata", () => {
        const error = createPgDatabaseError({
            code: "23505",
            constraint: "user_email_key",
            table: "user"
        });

        assert.equal(pgErrors.uniqueViolation().matches(error), true);
        assert.equal(pgErrors.uniqueViolation({ constraint: "user_email_key", table: "user" }).matches(error), true);
        assert.equal(pgErrors.foreignKeyViolation().matches(error), false);
    });

    it("translates PostgreSQL errors before mapErr handles abstract database errors", async () => {
        const db = createTxDb(new FakePool());

        await assert.rejects(
            db
                .query(createThrowingQuery(createPgDatabaseError({ code: "23505" })), undefined)
                .multiple()
                .mapErr([databaseErrors.duplicateKey, (error) => new Error(`mapped ${error.kind}:${error.pg.code}`)]),
            /mapped duplicateKey:23505/
        );
        await assert.rejects(
            db
                .query(
                    createThrowingQuery(
                        createPgDatabaseError({
                            code: "23505",
                            constraint: "user_email_key",
                            table: "user"
                        })
                    ),
                    undefined
                )
                .single()
                .mapErr([
                    databaseErrors.duplicateKey,
                    (error) => new Error(`mapped pg constraint ${error.pg.constraint}`)
                ]),
            /mapped pg constraint user_email_key/
        );
        await assert.rejects(
            db
                .query(createThrowingQuery(createPgDatabaseError({ code: "23503" })), undefined)
                .multiple()
                .mapErr(
                    [databaseErrors.duplicateKey, () => new Error("mapped duplicate key")],
                    [databaseErrors.dataIntegrityViolation, (error) => new Error(`mapped integrity ${error.pg.code}`)],
                    [Error, () => new Error("mapped fallback")]
                ),
            /mapped integrity 23503/
        );
        await assert.rejects(
            db
                .query(createThrowingQuery(createPgDatabaseError({ code: "XX000" })), undefined)
                .multiple()
                .mapErr(
                    [databaseErrors.duplicateKey, () => new Error("mapped duplicate key")],
                    [databaseErrors.access, databaseFallbackError]
                ),
            (error) => {
                assert.ok(error instanceof AppError);
                assert.equal(error.code, "DATABASE_ERROR");
                assert.equal(error.message, "Database operation failed.");
                assert.equal(error.statusCode, 500);
                const cause = error.cause;
                assert.ok(cause instanceof DatabaseUnknownError);
                assert.ok(cause.cause instanceof DatabaseError);
                return true;
            }
        );
        await assert.rejects(
            db.query(createThrowingQuery(createPgDatabaseError({ code: "23505" })), undefined).multiple(),
            databaseErrors.duplicateKey
        );
    });

    it("maps errors with ordered constructor, name, and fallback mappings", async () => {
        const db = createTxDb(new FakePool());

        await assert.rejects(
            db
                .query(createThrowingQuery(new QueryResultError("single", 0)), undefined)
                .single()
                .mapErr([QueryResultError, () => new Error("mapped query result")]),
            /mapped query result/
        );
        await assert.rejects(
            db
                .query(createThrowingQuery(new ExternalQueryError()), undefined)
                .single()
                .mapErr(
                    ["ExternalQueryError", () => new Error("mapped by name")],
                    [Error, () => new Error("mapped fallback")]
                ),
            /mapped by name/
        );
        await assert.rejects(
            db
                .query(createThrowingQuery(new OtherQueryError()), undefined)
                .single()
                .mapErr(
                    ["ExternalQueryError", () => new Error("mapped by name")],
                    [Error, () => new Error("mapped fallback")]
                ),
            /mapped fallback/
        );
    });

    it("uses savepoints for Nested propagation inside an active transaction", async () => {
        const pool = new FakePool();
        const txHost = createTransactionHost(pool);

        await txHost.withTransaction(async () => {
            await assert.rejects(
                txHost.withTransaction(Propagation.Nested, async () => {
                    throw new Error("nested failure");
                }),
                /nested failure/
            );

            await txHost.tx.query(selectRowsQuery, undefined).multiple();
        });

        const statements = getStatements(pool.clients[0]);
        assert.equal(statements[0], "BEGIN");
        assert.match(statements[1] ?? "", /^SAVEPOINT pgtyped_cls_tx_\d+$/);
        assert.match(statements[2] ?? "", /^ROLLBACK TO SAVEPOINT pgtyped_cls_tx_\d+$/);
        assert.match(statements[3] ?? "", /^RELEASE SAVEPOINT pgtyped_cls_tx_\d+$/);
        assert.equal(statements[4], "SELECT rows");
        assert.equal(statements[5], "COMMIT");
    });

    it("keeps the legacy tx helper as a thin TransactionHost wrapper", async () => {
        const pool = new FakePool();
        createDefaultTransactionHost(pool);

        await tx(async (db) => {
            await db.query(selectRowsQuery, undefined).multiple();
        });

        assert.deepEqual(getStatements(pool.clients[0]), ["BEGIN", "SELECT rows", "COMMIT"]);
    });
});

function createAdapterOptions(pool: FakePool) {
    return new PgTypedTransactionalAdapter().optionsFactory(pool as unknown as Pool);
}

function createThrowingQuery(error: Error) {
    return {
        run: async () => {
            throw error;
        }
    };
}

function createPgDatabaseError(fields: Partial<DatabaseError>) {
    const error = new DatabaseError("postgres failed", 0, "error");
    Object.assign(error, fields);

    return error;
}

function createTransactionHost(pool: FakePool) {
    return createTransactionHostWithConnectionName(pool, `test-${Date.now()}-${Math.random()}`);
}

function createDefaultTransactionHost(pool: FakePool) {
    return createTransactionHostWithConnectionName(pool, undefined);
}

function createTransactionHostWithConnectionName(pool: FakePool, connectionName: string | undefined) {
    return new TransactionHost<PgTypedTransactionalAdapter>({
        ...createAdapterOptions(pool),
        connectionName,
        defaultTxOptions: {},
        enableTransactionProxy: false,
        extraProviderTokens: []
    });
}

function getStatements(executor: FakeExecutor | undefined) {
    return executor?.calls.map((call) => call.text) ?? [];
}

function isTransactionControlStatement(text: string) {
    return /^(BEGIN|COMMIT|ROLLBACK|SAVEPOINT|RELEASE)(\s|$)/.test(text);
}
