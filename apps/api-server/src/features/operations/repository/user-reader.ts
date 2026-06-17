import type { UserOption } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { listUsers } from "@/features/operations/database/__generated__/operations.queries";

@Injectable()
export class UserReader {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async list(): Promise<UserOption[]> {
        const users = await this.db.query(listUsers, undefined).multiple();

        return users.map((user) => ({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role as UserOption["role"]
        }));
    }
}
