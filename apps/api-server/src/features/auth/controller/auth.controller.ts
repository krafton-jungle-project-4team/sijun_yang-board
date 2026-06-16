import type { AuthClaims } from "@nmm/shared";
import { Body, Controller, Get, Patch, Post, Res, UseGuards } from "@nestjs/common";
import { completeSignupInputSchema, loginInputSchema, updateMeInputSchema } from "@nmm/shared";
import type { Response } from "express";

import { AuthCommandService, AuthQueryService } from "../service";
import { ActiveAccountGuard } from "./active-account.guard";
import { CurrentAuth } from "./current-auth.decorator";
import { SessionUserGuard } from "./session-user.guard";
import { clearSessionCookie, setSessionCookie } from "./session-cookie";

@Controller("account")
export class AuthController {
    constructor(
        private readonly authQuery: AuthQueryService,
        private readonly authCommand: AuthCommandService
    ) {}

    @Get("me")
    @UseGuards(SessionUserGuard)
    async getMe(@CurrentAuth() auth: AuthClaims) {
        return this.authQuery.getUser(auth.userId);
    }

    @Post("login")
    async login(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
        const input = loginInputSchema.parse(body);
        const result = await this.authCommand.login(input);

        setSessionCookie(response, result.sessionId);

        return this.authQuery.getUser(result.userId);
    }

    @Post("complete-signup")
    @UseGuards(SessionUserGuard)
    async completeSignup(@CurrentAuth() auth: AuthClaims, @Body() body: unknown) {
        const input = completeSignupInputSchema.parse(body);
        const result = await this.authCommand.completeSignup(auth.userId, input);

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
    @UseGuards(SessionUserGuard)
    async logout(@CurrentAuth() auth: AuthClaims, @Res({ passthrough: true }) response: Response) {
        await this.authCommand.expireUserSessions(auth.userId);
        clearSessionCookie(response);

        return { id: auth.userId };
    }
}
