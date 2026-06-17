import type { UpdateMeInput } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { updateMe } from "@/features/auth/database/__generated__/auth.queries";

/**
 * auth가 소유한 user account field를 PgTyped query로 쓴다.
 *
 * auth feature에 속한 profile update에서 사용한다.
 * write result는 최소로 유지하고 missing row는 service가 domain error로 변환하게 한다.
 */
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
