import { randomUUID } from "node:crypto";

import type { LoginInput, SignupInput, UserRole } from "@nmm/shared";
import { Inject, Injectable } from "@nestjs/common";
import type { Request as ExpressRequest, Response as ExpressResponse } from "express";
import type { Pool } from "pg";

import { PG_POOL } from "@/infra/database/database.tokens";
import { serverEnv } from "@/infra/env";
import { authErrors } from "@/features/auth/auth-errors";

const authBasePath = "/api/auth";
const importEsm = new Function("specifier", "return import(specifier)") as <T>(specifier: string) => Promise<T>;

type BetterAuth = {
    handler(request: Request): Promise<Response>;
};

type BetterAuthModule = {
    betterAuth(options: Record<string, unknown>): BetterAuth;
};

type UsernameModule = {
    username(options: Record<string, unknown>): unknown;
    anonymous(options: Record<string, unknown>): unknown;
};

type BetterAuthCookiesModule = {
    splitSetCookieHeader(header: string): string[];
};

type AuthCallResult<TData> = {
    data: TData;
    setCookieHeaders: string[];
};

type BetterAuthUser = {
    id: string | number;
    email: string;
    isAnonymous: boolean;
    name: string;
    role: UserRole;
    createdAt: string;
    updatedAt: string;
};

type BetterAuthSession = {
    id: string;
    token: string;
    userId: string | number;
};

type BetterAuthSessionData = {
    session: BetterAuthSession;
    user: BetterAuthUser;
};

type SignInUsernameData = {
    token: string;
    user: BetterAuthUser;
};

type SignUpEmailData = {
    user: BetterAuthUser;
};

/**
 * Better Auth를 API 서버의 request, response, database 관례에 맞게 연결한다.
 *
 * Better Auth session, signup, signin, cookie handling의 유일한 boundary로 사용한다.
 * service가 provider-specific 세부 사항에 의존하지 않도록 dynamic ESM import와 cookie naming은 여기에서만 다룬다.
 */
@Injectable()
export class BetterAuthProvider {
    private readonly auth: Promise<BetterAuth>;
    private readonly cookieHelpers: Promise<BetterAuthCookiesModule>;

    constructor(
        @Inject(PG_POOL)
        private readonly pool: Pool
    ) {
        this.auth = this.createAuth();
        this.cookieHelpers = importEsm<BetterAuthCookiesModule>("better-auth/cookies");
    }

    async getSession(request: ExpressRequest): Promise<BetterAuthSessionData | null> {
        const result = await this.callAuth<BetterAuthSessionData | null>({
            body: null,
            method: "GET",
            path: "/get-session",
            request
        });

        return result.data;
    }

    async signIn(input: LoginInput, request: ExpressRequest): Promise<AuthCallResult<SignInUsernameData>> {
        return this.callAuth<SignInUsernameData>({
            body: {
                password: input.password,
                username: input.loginId
            },
            method: "POST",
            path: "/sign-in/username",
            request
        });
    }

    async signUp(input: SignupInput, request: ExpressRequest): Promise<AuthCallResult<SignUpEmailData>> {
        return this.callAuth<SignUpEmailData>({
            body: {
                email: input.email.toLowerCase(),
                name: input.displayName,
                password: input.password,
                username: input.loginId
            },
            method: "POST",
            path: "/sign-up/email",
            request
        });
    }

    async signOut(request: ExpressRequest): Promise<AuthCallResult<{ success: boolean }>> {
        return this.callAuth<{ success: boolean }>({
            body: {},
            method: "POST",
            path: "/sign-out",
            request
        });
    }

    appendSetCookieHeaders(response: ExpressResponse, setCookieHeaders: string[]) {
        for (const cookie of setCookieHeaders) {
            response.append("set-cookie", cookie);
        }
    }

    clearSessionCookie(response: ExpressResponse) {
        response.clearCookie(serverEnv.SESSION_COOKIE_NAME, {
            httpOnly: true,
            path: "/",
            sameSite: "lax",
            secure: serverEnv.NODE_ENV === "production"
        });
    }

    private async createAuth(): Promise<BetterAuth> {
        const [{ betterAuth }, { anonymous, username }] = await Promise.all([
            importEsm<BetterAuthModule>("better-auth"),
            importEsm<UsernameModule>("better-auth/plugins")
        ]);

        return betterAuth({
            advanced: {
                cookies: {
                    session_token: {
                        attributes: {
                            httpOnly: true,
                            path: "/",
                            sameSite: "lax",
                            secure: serverEnv.NODE_ENV === "production"
                        },
                        name: serverEnv.SESSION_COOKIE_NAME
                    }
                },
                database: {
                    generateId: ({ model }: { model: string }) => (model === "user" ? false : randomUUID())
                },
                useSecureCookies: serverEnv.NODE_ENV === "production"
            },
            appName: "Namanmu",
            basePath: authBasePath,
            baseURL: serverEnv.BETTER_AUTH_URL,
            database: this.pool,
            emailAndPassword: {
                autoSignIn: false,
                enabled: true,
                maxPasswordLength: 200,
                minPasswordLength: 1
            },
            plugins: [
                anonymous({
                    schema: {
                        user: {
                            fields: {
                                isAnonymous: "is_anonymous"
                            }
                        }
                    }
                }),
                username({
                    maxUsernameLength: 80,
                    minUsernameLength: 1,
                    schema: {
                        user: {
                            fields: {
                                displayUsername: "display_username",
                                username: "login_id"
                            }
                        }
                    },
                    usernameNormalization: false,
                    usernameValidator: () => true
                })
            ],
            rateLimit: {
                enabled: false
            },
            secret: serverEnv.BETTER_AUTH_SECRET,
            session: {
                expiresIn: 60 * 60 * 24 * 30,
                fields: {
                    createdAt: "created_at",
                    expiresAt: "expires_at",
                    ipAddress: "ip_address",
                    token: "token",
                    updatedAt: "updated_at",
                    userAgent: "user_agent",
                    userId: "user_id"
                },
                modelName: "sessions",
                updateAge: 60 * 60 * 24
            },
            trustedOrigins: [serverEnv.WEB_ORIGIN, serverEnv.BETTER_AUTH_URL],
            user: {
                additionalFields: {
                    role: {
                        defaultValue: "USER",
                        input: false,
                        required: true,
                        type: ["USER", "ADMIN"]
                    }
                },
                fields: {
                    createdAt: "created_at",
                    emailVerified: "email_verified",
                    image: "image",
                    name: "display_name",
                    updatedAt: "updated_at"
                }
            },
            account: {
                fields: {
                    accessToken: "access_token",
                    accessTokenExpiresAt: "access_token_expires_at",
                    accountId: "account_id",
                    createdAt: "created_at",
                    idToken: "id_token",
                    providerId: "provider_id",
                    refreshToken: "refresh_token",
                    refreshTokenExpiresAt: "refresh_token_expires_at",
                    updatedAt: "updated_at",
                    userId: "user_id"
                }
            },
            verification: {
                fields: {
                    createdAt: "created_at",
                    expiresAt: "expires_at",
                    updatedAt: "updated_at"
                }
            }
        });
    }

    private async callAuth<TData>(input: {
        body: Record<string, unknown> | null;
        method: "GET" | "POST";
        path: string;
        request: ExpressRequest;
    }): Promise<AuthCallResult<TData>> {
        const auth = await this.auth;
        const response = await auth.handler(this.createRequest(input));
        const data = await readJson(response);
        const setCookieHeaders = await this.getSetCookieHeaders(response.headers);

        if (!response.ok) {
            throw toBetterAuthAppError(data, response.status);
        }

        return {
            data: data as TData,
            setCookieHeaders
        };
    }

    private createRequest(input: {
        body: Record<string, unknown> | null;
        method: "GET" | "POST";
        path: string;
        request: ExpressRequest;
    }) {
        const headers = toWebHeaders(input.request);

        headers.set("accept", "application/json");

        if (input.body) {
            headers.set("content-type", "application/json");
        }

        return new Request(new URL(`${authBasePath}${input.path}`, serverEnv.BETTER_AUTH_URL), {
            body: input.body ? JSON.stringify(input.body) : undefined,
            headers,
            method: input.method
        });
    }

    private async getSetCookieHeaders(headers: Headers) {
        const headersWithCookies = headers as Headers & { getSetCookie?: () => string[] };

        if (headersWithCookies.getSetCookie) {
            return headersWithCookies.getSetCookie();
        }

        const setCookie = headers.get("set-cookie");

        if (!setCookie) {
            return [];
        }

        return (await this.cookieHelpers).splitSetCookieHeader(setCookie);
    }
}

function toWebHeaders(request: ExpressRequest) {
    const headers = new Headers();

    for (const [name, value] of Object.entries(request.headers)) {
        if (Array.isArray(value)) {
            for (const item of value) {
                headers.append(name, item);
            }
            continue;
        }

        if (value !== undefined) {
            headers.set(name, value);
        }
    }

    return headers;
}

async function readJson(response: Response): Promise<unknown> {
    const text = await response.text();

    if (!text) {
        return null;
    }

    return JSON.parse(text) as unknown;
}

function toBetterAuthAppError(data: unknown, statusCode: number) {
    const message = readErrorMessage(data);

    return authErrors.provider(message, statusCode);
}

function readErrorMessage(data: unknown) {
    if (isObject(data) && typeof data.message === "string") {
        return data.message;
    }

    if (isObject(data) && isObject(data.error) && typeof data.error.message === "string") {
        return data.error.message;
    }

    return "Authentication request failed.";
}

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}
