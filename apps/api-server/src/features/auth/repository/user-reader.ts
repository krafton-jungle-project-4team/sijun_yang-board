import type { UserRole } from "@nmm/shared";
import { InjectTransaction, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { PgTypedTransactionalAdapter } from "@/infra/database";
import { findUserByLoginIdOrEmail, getUserById } from "@/features/auth/database/__generated__/auth.queries";
import type { UserAccountSnapshot } from "@/features/auth/domain";

@Injectable()
export class UserReader {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    async findById(userId: number): Promise<UserAccountSnapshot | null> {
        const user = await this.db.query(getUserById, { userId }).singleOrNull();

        return user
            ? {
                  id: user.id,
                  email: user.email,
                  displayName: user.displayName,
                  role: user.role as UserRole,
                  createdAt: user.createdAt,
                  updatedAt: user.updatedAt
              }
            : null;
    }

    async existsByLoginIdOrEmail(loginId: string, email: string): Promise<boolean> {
        const user = await this.db.query(findUserByLoginIdOrEmail, { email, loginId }).singleOrNull();

        return Boolean(user);
    }
}
