import type { AuthClaims } from "@nmm/shared";
import type { Request } from "express";

export type RequestWithAuth = Request & {
    auth?: AuthClaims;
};
