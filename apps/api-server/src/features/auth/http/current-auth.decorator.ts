import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

import { getRequestAuth } from "./request-auth-context";

export const CurrentAuth = createParamDecorator((_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();

    return getRequestAuth(request);
});
