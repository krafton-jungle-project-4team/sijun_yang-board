import type { AuthClaims } from "@nmm/shared";
import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { loginInputSchema, signupInputSchema, updateMeInputSchema } from "@nmm/shared";
import type { Request, Response } from "express";

import { suspendedAccountError } from "../auth-errors";
import { AuthCommandService, AuthQueryService } from "../service";
import { ActiveAccountGuard } from "./active-account.guard";
import { CurrentAuth } from "./current-auth.decorator";
import { SessionUserGuard } from "./session-user.guard";
import { clearSessionCookie, getSessionIdFromRequest, setSessionCookie } from "./session-cookie";

@Controller("account")
export class AuthController {
    constructor(
        private readonly authQuery: AuthQueryService,
        private readonly authCommand: AuthCommandService
    ) {}

    @Get("me")
    async getMe(@Req() request: Request) {
        const sessionId = getSessionIdFromRequest(request);

        if (!sessionId) {
            return null;
        }

        const auth = await this.authQuery.getClaimsBySessionId(sessionId);

        if (!auth) {
            return null;
        }

        if (auth.status === "SUSPENDED") {
            throw suspendedAccountError();
        }

        return this.authQuery.getUser(auth.userId);
    }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
        const input = loginInputSchema.parse(body);
        const result = await this.authCommand.login(input);

        setSessionCookie(response, result.sessionId);

        return this.authQuery.getUser(result.userId);
    }

    @Post("signup")
    async signup(@Body() body: unknown) {
        const input = signupInputSchema.parse(body);
        const result = await this.authCommand.signup(input);

        return this.authQuery.getUser(result.id);
    }

    @Patch("me")
    @UseGuards(SessionUserGuard, ActiveAccountGuard)
    async updateMe(@CurrentAuth() auth: AuthClaims, @Body() body: unknown) {
        const input = updateMeInputSchema.parse(body);
        const result = await this.authCommand.updateMe(auth.userId, input);

        return this.authQuery.getUser(result.id);
    }

    @Post("logout")
    @HttpCode(HttpStatus.OK)
    @UseGuards(SessionUserGuard)
    async logout(@CurrentAuth() auth: AuthClaims, @Res({ passthrough: true }) response: Response) {
        await this.authCommand.expireUserSessions(auth.userId);
        clearSessionCookie(response);

        return { id: auth.userId };
    }
}
