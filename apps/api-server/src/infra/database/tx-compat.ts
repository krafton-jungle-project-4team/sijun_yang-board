import { TransactionHost } from "@nestjs-cls/transactional";

import type { PgTypedTransactionalAdapter } from "./pgtyped-transactional.adapter";
import type { TxDb } from "./tx";

/** @deprecated Prefer @Transactional() with an injected Transaction<PgTypedTransactionalAdapter>. */
export async function tx<T>(callback: (db: TxDb) => Promise<T>): Promise<T> {
    const txHost = TransactionHost.getInstance<PgTypedTransactionalAdapter>();

    return txHost.withTransaction(async () => callback(txHost.tx));
}
