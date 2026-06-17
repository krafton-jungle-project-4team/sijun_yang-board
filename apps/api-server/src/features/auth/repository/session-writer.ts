import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { deleteSessionByToken } from "@/features/auth/database/__generated__/auth.queries";

@Injectable()
export class SessionWriter {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async expireByToken(token: string): Promise<void> {
        await this.db.query(deleteSessionByToken, { token }).multiple();
    }
}
