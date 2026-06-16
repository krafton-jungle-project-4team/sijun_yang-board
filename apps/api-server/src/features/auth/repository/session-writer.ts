import { randomUUID } from "node:crypto";

import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "../../../infra/database";
import { createSessionForUser, deleteSessionsByUserId } from "../database/__generated__/auth.queries";
import type { AuthSession } from "../domain";

@Injectable()
export class SessionWriter {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async createForUser(userId: number): Promise<AuthSession | null> {
        const session = await this.db
            .query(createSessionForUser, {
                sessionId: randomUUID(),
                userId
            })
            .singleOrNull();

        return session ? { id: session.id, userId: session.userId } : null;
    }

    async expireByUserId(userId: number): Promise<void> {
        await this.db.query(deleteSessionsByUserId, { userId }).multiple();
    }
}
