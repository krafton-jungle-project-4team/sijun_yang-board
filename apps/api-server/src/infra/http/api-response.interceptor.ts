import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import type { Request, Response } from "express";
import { map, type Observable } from "rxjs";

import { createApiSuccess, type RequestWithRequestId } from "./api-response";

@Injectable()
export class ApiResponseInterceptor<TData> implements NestInterceptor<
    TData,
    ReturnType<typeof createApiSuccess<TData>>
> {
    intercept(
        context: ExecutionContext,
        next: CallHandler<TData>
    ): Observable<ReturnType<typeof createApiSuccess<TData>>> {
        const request = context.switchToHttp().getRequest<Request & RequestWithRequestId>();
        const response = context.switchToHttp().getResponse<Response>();
        const requestId = request.requestId ?? "missing-request-id";

        response.setHeader("x-request-id", requestId);

        return next.handle().pipe(map((data) => createApiSuccess(requestId, data)));
    }
}
