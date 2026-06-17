import { apiFailureSchema, createApiSuccessSchema } from "@nmm/shared";
import axios, { type AxiosRequestConfig, type Method } from "axios";
import type { z } from "zod";

import { clientEnv } from "@/shared/env/client-env";

type SearchParams = string | URLSearchParams | Record<string, boolean | number | string | null | undefined>;

export type RequestOptions = Omit<
    AxiosRequestConfig,
    "baseURL" | "data" | "method" | "params" | "url" | "withCredentials"
> & {
    searchParams?: SearchParams;
};

type JsonRequestOptions = RequestOptions & {
    json?: unknown;
    method: Method;
};

const http = axios.create({
    baseURL: new URL(clientEnv.VITE_API_BASE_URL, window.location.origin).toString(),
    withCredentials: true
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

export async function getJson<TSchema extends z.ZodType>(path: string, schema: TSchema, options?: RequestOptions) {
    return requestJson(path, schema, {
        ...options,
        method: "get"
    });
}

export async function postJson<TSchema extends z.ZodType>(
    path: string,
    schema: TSchema,
    json?: unknown,
    options?: RequestOptions
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
    options?: RequestOptions
) {
    return requestJson(path, schema, {
        ...options,
        json,
        method: "patch"
    });
}

export async function deleteJson<TSchema extends z.ZodType>(path: string, schema: TSchema, options?: RequestOptions) {
    return requestJson(path, schema, {
        ...options,
        method: "delete"
    });
}

async function requestJson<TSchema extends z.ZodType>(path: string, schema: TSchema, options: JsonRequestOptions) {
    try {
        const { json, method, searchParams, ...requestOptions } = options;
        const response = await http.request<unknown>({
            ...requestOptions,
            data: json,
            method,
            params: normalizeSearchParams(searchParams),
            url: path
        });
        const envelope = createApiSuccessSchema(schema).parse(response.data) as { data: z.infer<TSchema> };

        return envelope.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const parsed = apiFailureSchema.safeParse(error.response?.data);

            if (parsed.success) {
                throw new ApiClientError(parsed.data.error.code, parsed.data.error.message, parsed.data.requestId);
            }
        }

        throw error;
    }
}

function normalizeSearchParams(searchParams: SearchParams | undefined) {
    if (typeof searchParams === "string") {
        return new URLSearchParams(searchParams);
    }

    return searchParams;
}
