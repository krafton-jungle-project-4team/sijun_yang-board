import type { AuthClaims, User } from "@nmm/shared";
import { InjectTransaction, Transactional, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { AppError } from "../../../app-errors";
import { PgTypedTransactionalAdapter } from "../../../infra/database";
import { toUserModel } from "../auth.model";
import { getClaimsBySessionId, getUserById } from "../database/__generated__/auth.queries";

@Injectable()
export class AuthQueryService {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    @Transactional<PgTypedTransactionalAdapter>()
    async getClaimsBySessionId(sessionId: string): Promise<AuthClaims | null> {
        const session = await this.db.query(getClaimsBySessionId, { sessionId }).singleOrNull();

        if (!session) {
            return null;
        }

        return {
            userId: session.userId,
            sessionId: session.id,
            role: session.role as AuthClaims["role"],
            status: session.status as AuthClaims["status"]
        };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async getUser(userId: number): Promise<User> {
        const user = await this.db.query(getUserById, { userId }).singleOrNull();

        if (!user) {
            throw new AppError("NOT_FOUND", "User not found.", 404);
        }

        return toUserModel(user);
    }
}
