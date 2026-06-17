import type { Request } from "express";

import type { AuthClaims } from "@/features/auth/domain";

export type RequestWithAuth = Request & {
    auth?: AuthClaims;
};
