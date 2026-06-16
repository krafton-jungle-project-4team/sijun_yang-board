import type { ApiSuccess } from "@nmm/shared";

export type RequestWithRequestId = {
    requestId?: string;
};

export function createApiSuccess<TData>(requestId: string, data: TData): ApiSuccess<TData> {
    return {
        requestId,
        data
    };
}
