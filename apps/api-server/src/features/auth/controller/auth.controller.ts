import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { loginInputSchema, signupInputSchema, updateMeInputSchema } from "@nmm/shared";
import type { Request, Response } from "express";

import type { AuthClaims } from "@/features/auth/domain";
import { AuthenticatedUserGuard, CurrentAuth } from "@/features/auth/http";
import { AuthCommandService, AuthQueryService } from "@/features/auth/service";

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

        return this.authQuery.getActiveUser(auth.userId);
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
    @UseGuards(AuthenticatedUserGuard)
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
