import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import type { Response } from "express";
import { map, type Observable } from "rxjs";

import { createApiSuccess, ensureRequestId, setRequestIdHeader, type RequestWithRequestId } from "./api-response";

/**
 * 성공한 controller 결과를 공유 API success envelope로 감싼다.
 *
 * 애플리케이션 데이터를 반환하는 JSON endpoint의 전역 response interceptor로 사용한다.
 * request id와 envelope 형태는 이 interceptor가 소유하므로 controller 반환값을 미리 감싸지 않는다.
 */
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
