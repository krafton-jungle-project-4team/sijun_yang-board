import type { Request, Response } from "express";

import { serverEnv } from "../../../infra/env";
import { authEnv } from "../auth.env";

const sessionCookieMaxAgeMs = 30 * 24 * 60 * 60 * 1000;
const sessionIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function setSessionCookie(response: Response, sessionId: string) {
    response.cookie(authEnv.sessionCookieName, sessionId, {
        httpOnly: true,
        maxAge: sessionCookieMaxAgeMs,
        path: "/",
        sameSite: "lax",
        secure: serverEnv.NODE_ENV === "production"
    });
}

export function clearSessionCookie(response: Response) {
    response.clearCookie(authEnv.sessionCookieName, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: serverEnv.NODE_ENV === "production"
    });
}

export function getSessionIdFromRequest(request: Request): string | null {
    const authorization = request.header("authorization");

    if (authorization?.startsWith("Bearer ")) {
        return parseSessionId(authorization.slice("Bearer ".length));
    }

    const cookieHeader = request.header("cookie");

    if (!cookieHeader) {
        return null;
    }

    const sessionCookie = cookieHeader
        .split(";")
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith(`${authEnv.sessionCookieName}=`));

    if (!sessionCookie) {
        return null;
    }

    return parseSessionId(decodeURIComponent(sessionCookie.slice(authEnv.sessionCookieName.length + 1)));
}

function parseSessionId(value: string): string | null {
    return sessionIdPattern.test(value) ? value : null;
}
