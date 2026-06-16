import type { AuthClaims } from "@nmm/shared";
import { Body, Controller, Get, Patch, Post, UseGuards } from "@nestjs/common";
import { completeSignupInputSchema, updateMeInputSchema } from "@nmm/shared";

import { AuthCommandService, AuthQueryService } from "../service";
import { ActiveAccountGuard } from "./active-account.guard";
import { CurrentAuth } from "./current-auth.decorator";
import { SessionUserGuard } from "./session-user.guard";

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
    async logout(@CurrentAuth() auth: AuthClaims) {
        await this.authCommand.expireUserSessions(auth.userId);

        return { id: auth.userId };
    }
}
