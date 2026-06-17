import type { UserOption } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { listUsers } from "@/features/operations/database/__generated__/operations.queries";

/**
 * operations 화면에서 선택지로 사용할 사용자 목록을 읽는다.
 *
 * project owner나 task assignee 선택 UI가 UserOption list를 필요로 할 때 사용한다.
 * auth feature 내부 account 조회와 구분되도록 operations 전용 read model만 반환한다.
 */
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
