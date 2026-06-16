import type { TransactionalAdapter, TransactionalAdapterOptions } from "@nestjs-cls/transactional";
import type { Pool } from "pg";

import { PG_POOL } from "./database.tokens";
import { createTxDb, getTxDbExecutor, type PgExecutor, type TxDb } from "./tx";

export type PgIsolationLevel = "READ COMMITTED" | "REPEATABLE READ" | "SERIALIZABLE" | "READ UNCOMMITTED";

export interface PgTypedTransactionOptions {
    isolationLevel?: PgIsolationLevel;
    readOnly?: boolean;
    deferrable?: boolean;
}

let savepointSequence = 0;

export class PgTypedTransactionalAdapter implements TransactionalAdapter<Pool, TxDb, PgTypedTransactionOptions> {
    readonly connectionToken = PG_POOL;

    readonly defaultTxOptions?: Partial<PgTypedTransactionOptions>;

    constructor(defaultTxOptions?: Partial<PgTypedTransactionOptions>) {
        this.defaultTxOptions = defaultTxOptions;
    }

    optionsFactory(pool: Pool): TransactionalAdapterOptions<TxDb, PgTypedTransactionOptions> {
        return {
            wrapWithTransaction: async (options, fn, setTx) => {
                const client = await pool.connect();

                try {
                    await client.query(getBeginTransactionSql(options));
                    const db = createTxDb(client);
                    setTx(db);
                    const result = await fn();
                    await client.query("COMMIT");

                    return result;
                } catch (error) {
                    await client.query("ROLLBACK");
                    throw error;
                } finally {
                    client.release();
                }
            },
            wrapWithNestedTransaction: async (_options, fn, setTx, db) => {
                const executor = getTxDbExecutor(db);
                const savepointName = getNextSavepointName();

                await executor.query(`SAVEPOINT ${savepointName}`, []);
                setTx(db);

                try {
                    const result = await fn();
                    await executor.query(`RELEASE SAVEPOINT ${savepointName}`, []);

                    return result;
                } catch (error) {
                    await executor.query(`ROLLBACK TO SAVEPOINT ${savepointName}`, []);
                    await executor.query(`RELEASE SAVEPOINT ${savepointName}`, []);
                    throw error;
                }
            },
            getFallbackInstance: () => createTxDb(pool as unknown as PgExecutor)
        };
    }
}

function getNextSavepointName() {
    savepointSequence += 1;
    return `pgtyped_cls_tx_${savepointSequence}`;
}

function getBeginTransactionSql(options: PgTypedTransactionOptions | undefined) {
    const clauses: string[] = [];

    if (options?.isolationLevel) {
        clauses.push(`ISOLATION LEVEL ${options.isolationLevel}`);
    }

    if (options?.readOnly !== undefined) {
        clauses.push(options.readOnly ? "READ ONLY" : "READ WRITE");
    }

    if (options?.deferrable !== undefined) {
        clauses.push(options.deferrable ? "DEFERRABLE" : "NOT DEFERRABLE");
    }

    return clauses.length === 0 ? "BEGIN" : `BEGIN ${clauses.join(" ")}`;
}
