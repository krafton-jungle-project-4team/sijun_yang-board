import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import type { Response } from "express";
import { map, type Observable } from "rxjs";

import { createApiSuccess, ensureRequestId, setRequestIdHeader, type RequestWithRequestId } from "./api-response";

@Injectable()
export class ApiResponseInterceptor<TData> implements NestInterceptor<
    TData,
    ReturnType<typeof createApiSuccess<TData>>
> {
    intercept(
        context: ExecutionContext,
        next: CallHandler<TData>
    ): Observable<ReturnType<typeof createApiSuccess<TData>>> {
        const request = context.switchToHttp().getRequest<RequestWithRequestId>();
        const response = context.switchToHttp().getResponse<Response>();
        const requestId = ensureRequestId(request);

        setRequestIdHeader(response, requestId);

        return next.handle().pipe(map((data) => createApiSuccess(requestId, data)));
    }
}
