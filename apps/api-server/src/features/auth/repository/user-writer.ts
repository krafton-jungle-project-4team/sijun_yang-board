import type { UpdateMeInput } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { updateMe } from "@/features/auth/database/__generated__/auth.queries";

@Injectable()
export class UserWriter {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async updateMe(userId: number, input: UpdateMeInput): Promise<number | null> {
        const user = await this.db.query(updateMe, { userId, displayName: input.displayName ?? null }).singleOrNull();

        return user?.id ?? null;
    }
}
