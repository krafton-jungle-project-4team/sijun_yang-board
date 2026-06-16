import { apiFailureSchema, createApiSuccessSchema } from "@nmm/shared";
import ky, { HTTPError, type Options } from "ky";
import type { z } from "zod";

import { clientEnv } from "../env/client-env";

const http = ky.create({
    prefixUrl: clientEnv.VITE_API_BASE_URL.replace(/^\//, ""),
    credentials: "include"
});

export class ApiClientError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly requestId?: string
    ) {
        super(message);
    }
}

export async function getJson<TSchema extends z.ZodType>(path: string, schema: TSchema, options?: Options) {
    return requestJson(path, schema, {
        ...options,
        method: "get"
    });
}

export async function postJson<TSchema extends z.ZodType>(
    path: string,
    schema: TSchema,
    json?: unknown,
    options?: Options
) {
    return requestJson(path, schema, {
        ...options,
        json,
        method: "post"
    });
}

export async function patchJson<TSchema extends z.ZodType>(
    path: string,
    schema: TSchema,
    json?: unknown,
    options?: Options
) {
    return requestJson(path, schema, {
        ...options,
        json,
        method: "patch"
    });
}

export async function deleteJson<TSchema extends z.ZodType>(path: string, schema: TSchema, options?: Options) {
    return requestJson(path, schema, {
        ...options,
        method: "delete"
    });
}

async function requestJson<TSchema extends z.ZodType>(path: string, schema: TSchema, options: Options) {
    try {
        const response = await http(path, options).json<unknown>();
        const envelope = createApiSuccessSchema(schema).parse(response) as { data: z.infer<TSchema> };

        return envelope.data;
    } catch (error) {
        if (error instanceof HTTPError) {
            const response = await error.response.json().catch(() => null);
            const parsed = apiFailureSchema.safeParse(response);

            if (parsed.success) {
                throw new ApiClientError(parsed.data.error.code, parsed.data.error.message, parsed.data.requestId);
            }
        }

        throw error;
    }
}
