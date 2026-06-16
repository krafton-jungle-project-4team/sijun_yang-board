import type { CompleteSignupInput, IdCommandResult, UpdateMeInput } from "@nmm/shared";
import { InjectTransaction, Transactional, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { AppError } from "../../../app-errors";
import { PgTypedTransactionalAdapter } from "../../../infra/database";
import { completeSignup, deleteSessionsByUserId, updateMe } from "../database/__generated__/auth.queries";

@Injectable()
export class AuthCommandService {
    constructor(
        @InjectTransaction()
        private readonly db: Transaction<PgTypedTransactionalAdapter>
    ) {}

    @Transactional<PgTypedTransactionalAdapter>()
    async completeSignup(userId: number, input: CompleteSignupInput): Promise<IdCommandResult> {
        const user = await this.db.query(completeSignup, { userId, displayName: input.displayName }).singleOrNull();

        if (!user) {
            throw new AppError("NOT_FOUND", "User not found.", 404);
        }

        return { id: user.id };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async updateMe(userId: number, input: UpdateMeInput): Promise<IdCommandResult> {
        const user = await this.db.query(updateMe, { userId, displayName: input.displayName ?? null }).singleOrNull();

        if (!user) {
            throw new AppError("NOT_FOUND", "User not found.", 404);
        }

        return { id: user.id };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async expireUserSessions(userId: number): Promise<void> {
        await this.db.query(deleteSessionsByUserId, { userId }).multiple();
    }
}
