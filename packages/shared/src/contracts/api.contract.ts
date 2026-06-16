import { z } from "zod";

export const requestIdSchema = z.string().min(1);

export const apiErrorSchema = z.object({
    code: z.string().min(1),
    message: z.string().min(1)
});

export const createApiSuccessSchema = <TData extends z.ZodType>(dataSchema: TData) =>
    z.object({
        requestId: requestIdSchema,
        data: dataSchema
    });

export const apiFailureSchema = z.object({
    requestId: requestIdSchema,
    error: apiErrorSchema
});

export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiSuccess<TData> = {
    requestId: string;
    data: TData;
};
export type ApiFailure = z.infer<typeof apiFailureSchema>;
export type ApiEnvelope<TData> = ApiSuccess<TData> | ApiFailure;

export const idCommandResultSchema = z.object({
    id: z.number().int().positive()
});

export type IdCommandResult = z.infer<typeof idCommandResultSchema>;
