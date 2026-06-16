import { randomUUID, scryptSync, timingSafeEqual } from "node:crypto";

import type { CompleteSignupInput, IdCommandResult, LoginInput, UpdateMeInput } from "@nmm/shared";
import { InjectTransaction, Transactional, type Transaction } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { AppError } from "../../../app-errors";
import { PgTypedTransactionalAdapter } from "../../../infra/database";
import {
    completeSignup,
    createSessionForUser,
    deleteSessionsByUserId,
    getLoginCredentialsByLoginId,
    updateMe
} from "../database/__generated__/auth.queries";

const passwordHashPrefix = "scrypt:v1:";

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
    async login(input: LoginInput): Promise<{ sessionId: string; userId: number }> {
        const credentials = await this.db
            .query(getLoginCredentialsByLoginId, { loginId: input.loginId })
            .singleOrNull();

        if (!credentials || !verifyPassword(input.password, credentials.passwordHash)) {
            throw new AppError("INVALID_CREDENTIALS", "Invalid ID or password.", 401);
        }

        if (credentials.status === "SUSPENDED") {
            throw new AppError("ACCOUNT_SUSPENDED", "This account is suspended.", 403);
        }

        const session = await this.createSession(credentials.id);

        return {
            sessionId: session.id,
            userId: session.userId
        };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async createSession(userId: number): Promise<{ id: string; userId: number }> {
        const session = await this.db
            .query(createSessionForUser, {
                sessionId: randomUUID(),
                userId
            })
            .singleOrNull();

        if (!session) {
            throw new AppError("NOT_FOUND", "User not found.", 404);
        }

        return session;
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async expireUserSessions(userId: number): Promise<void> {
        await this.db.query(deleteSessionsByUserId, { userId }).multiple();
    }
}

function verifyPassword(password: string, storedHash: string): boolean {
    if (!storedHash.startsWith(passwordHashPrefix)) {
        return false;
    }

    const [, , salt, hash] = storedHash.split(":");

    if (!salt || !hash) {
        return false;
    }

    const expected = Buffer.from(hash, "base64");
    const actual = scryptSync(password, salt, expected.length);

    return expected.length === actual.length && timingSafeEqual(expected, actual);
}
