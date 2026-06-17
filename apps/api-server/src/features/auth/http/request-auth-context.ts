import type { Request } from "express";

import type { AuthClaims } from "@/features/auth/domain";

const authByRequest = new WeakMap<Request, AuthClaims>();

export function setRequestAuth(request: Request, auth: AuthClaims) {
    authByRequest.set(request, auth);
}

export function getRequestAuth(request: Request) {
    return authByRequest.get(request);
}
