import type { IdCommandResult, LoginInput, SignupInput, UpdateMeInput } from "@nmm/shared";
import { Transactional } from "@nestjs-cls/transactional";
import { Injectable } from "@nestjs/common";
import type { Request, Response } from "express";

import { AppError } from "@/app-errors";
import { PgTypedTransactionalAdapter } from "@/infra/database";
import { authErrors } from "@/features/auth/auth-errors";
import { BetterAuthProvider } from "@/features/auth/provider";
import { UserReader, UserWriter } from "@/features/auth/repository";

@Injectable()
export class AuthCommandService {
    constructor(
        private readonly userWriter: UserWriter,
        private readonly userReader: UserReader,
        private readonly betterAuth: BetterAuthProvider
    ) {}

    @Transactional<PgTypedTransactionalAdapter>()
    async updateMe(userId: number, input: UpdateMeInput): Promise<IdCommandResult> {
        const id = await this.userWriter.updateMe(userId, input);

        if (!id) {
            throw authErrors.userNotFound();
        }

        return { id };
    }

    @Transactional<PgTypedTransactionalAdapter>()
    async signup(input: SignupInput, request: Request): Promise<IdCommandResult> {
        if (await this.userReader.existsByLoginIdOrEmail(input.loginId, input.email.toLowerCase())) {
            throw authErrors.accountAlreadyExists();
        }

        const result = await this.betterAuth.signUp(input, request);
        const id = parseUserId(result.data.user.id);

        return { id };
    }

    async login(input: LoginInput, request: Request, response: Response): Promise<{ userId: number }> {
        const result = await this.betterAuth.signIn(input, request).catch((error: unknown) => {
            if (error instanceof AppError) {
                throw authErrors.invalidCredentials(error);
            }

            throw error;
        });
        const userId = parseUserId(result.data.user.id);

        this.betterAuth.appendSetCookieHeaders(response, result.setCookieHeaders);

        return { userId };
    }

    async logout(request: Request, response: Response): Promise<void> {
        const result = await this.betterAuth.signOut(request);

        this.betterAuth.appendSetCookieHeaders(response, result.setCookieHeaders);
        this.betterAuth.clearSessionCookie(response);
    }
}

function parseUserId(value: string | number): number {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw authErrors.invalidUser();
    }

    return id;
}
