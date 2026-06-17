import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { loginInputSchema, signupInputSchema, updateMeInputSchema } from "@nmm/shared";
import type { Request, Response } from "express";

import type { AuthClaims } from "@/features/auth/domain";
import { AuthGuard, CurrentAuth } from "@/features/auth/http";
import { AuthCommandService, AuthQueryService } from "@/features/auth/service";

/**
 * web client를 위한 account와 session HTTP endpoint를 처리한다.
 *
 * login, signup, logout, current-user, profile update route에서 사용한다.
 * request body parsing은 이 경계에서 끝내고 session 또는 user mutation은 auth service에 위임한다.
 */
@Controller("account")
export class AuthController {
    constructor(
        private readonly authQuery: AuthQueryService,
        private readonly authCommand: AuthCommandService
    ) {}

    @Get("me")
    async getMe(@Req() request: Request) {
        const auth = await this.authQuery.getClaimsByRequest(request);

        if (!auth) {
            return null;
        }

        return this.authQuery.getUser(auth.userId);
    }

    @Post("login")
    @HttpCode(HttpStatus.OK)
    async login(@Body() body: unknown, @Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const input = loginInputSchema.parse(body);
        const result = await this.authCommand.login(input, request, response);

        return this.authQuery.getUser(result.userId);
    }

    @Post("signup")
    async signup(@Body() body: unknown, @Req() request: Request) {
        const input = signupInputSchema.parse(body);
        const result = await this.authCommand.signup(input, request);

        return this.authQuery.getUser(result.id);
    }

    @Patch("me")
    @UseGuards(AuthGuard)
    async updateMe(@CurrentAuth() auth: AuthClaims, @Body() body: unknown) {
        const input = updateMeInputSchema.parse(body);
        const result = await this.authCommand.updateMe(auth.userId, input);

        return this.authQuery.getUser(result.id);
    }

    @Post("logout")
    @HttpCode(HttpStatus.OK)
    async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        await this.authCommand.logout(request, response);

        return { success: true };
    }
}
