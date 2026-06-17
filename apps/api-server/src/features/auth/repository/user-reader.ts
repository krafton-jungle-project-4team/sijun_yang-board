import type { User, UserRole } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { findUserByLoginIdOrEmail, getUserById } from "@/features/auth/database/__generated__/auth.queries";

interface UserAccountRecord {
    id: number;
    email: string;
    displayName: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * auth가 소유한 user account response를 PgTyped query로 읽는다.
 *
 * auth transaction 안에서 account lookup과 uniqueness check가 필요할 때 사용한다.
 * service가 generated row shape에 의존하지 않도록 반환 데이터는 shared user contract로 매핑한다.
 */
@Injectable()
export class UserReader {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async findById(userId: number): Promise<User | null> {
        const user = await this.db.query(getUserById, { userId }).singleOrNull();

        return user ? toUser(user) : null;
    }

    async existsByLoginIdOrEmail(loginId: string, email: string): Promise<boolean> {
        const user = await this.db.query(findUserByLoginIdOrEmail, { email, loginId }).singleOrNull();

        return Boolean(user);
    }
}

function toUser(user: UserAccountRecord): User {
    return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role as UserRole,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
    };
}
