import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import type { IdCommandResult, LoginInput, SignupInput, UpdateMeInput } from "@nmm/shared";
import { Transactional } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";

import { AppError } from "../../../app-errors";
import { DatabaseDuplicateKeyError, PgTypedTransactionalAdapter } from "../../../infra/database";
import { accountAlreadyExistsError } from "../auth-errors";
import { LoginCredentialsDomain } from "../domain";
import { SessionWriter, UserReader, UserWriter } from "../repository";

const passwordHashPrefix = "scrypt:v1:";
const passwordHashLength = 64;
const passwordSaltLength = 16;

@Injectable()
export class AuthCommandService {
    constructor(
        private readonly userWriter: UserWriter,
        private readonly userReader: UserReader,
        private readonly sessionWriter: SessionWriter
    ) {}

    @Transactional<PgTypedTransactionalAdapter>()
    async updateMe(userId: number, input: UpdateMeInput): Promise<IdCommandResult> {
        const id = await this.userWriter.updateMe(userId, input);

        if (!id) {
            throw new AppError("NOT_FOUND", "User not found.", 404);
        }

        return { id };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async signup(input: SignupInput): Promise<IdCommandResult> {
        try {
            const id = await this.userWriter.create({
                displayName: input.displayName,
                email: input.email,
                loginId: input.loginId,
                passwordHash: createPasswordHash(input.password)
            });

            return { id };
        } catch (error) {
            if (error instanceof DatabaseDuplicateKeyError) {
                throw accountAlreadyExistsError();
            }

            throw error;
        }
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async login(input: LoginInput): Promise<{ sessionId: string; userId: number }> {
        const credentials = await this.userReader.findCredentialsByLoginId(input.loginId);

        if (!credentials || !verifyPassword(input.password, credentials.passwordHash)) {
            throw new AppError("INVALID_CREDENTIALS", "Invalid ID or password.", 401);
        }

        if (LoginCredentialsDomain.isSuspended(credentials)) {
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
        const session = await this.sessionWriter.createForUser(userId);

        if (!session) {
            throw new AppError("NOT_FOUND", "User not found.", 404);
        }

        return session;
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async expireUserSessions(userId: number): Promise<void> {
        await this.sessionWriter.expireByUserId(userId);
    }
}

function createPasswordHash(password: string): string {
    const salt = randomBytes(passwordSaltLength).toString("base64url");
    const hash = scryptSync(password, salt, passwordHashLength).toString("base64");

    return `${passwordHashPrefix}${salt}:${hash}`;
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
