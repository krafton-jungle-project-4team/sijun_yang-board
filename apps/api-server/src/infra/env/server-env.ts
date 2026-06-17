import { z } from "zod";

import { loadEnvFile } from "./env-file";

loadEnvFile();

const serverEnvSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    WEB_ORIGIN: z.string().url(),
    BETTER_AUTH_URL: z.string().url().optional(),
    BETTER_AUTH_SECRET: z.string().min(32).default("nmm-development-better-auth-secret-32"),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
    SESSION_COOKIE_NAME: z.string().min(1).default("nmm_session"),
    DATABASE_HOST: z.string().min(1),
    DATABASE_PORT: z.coerce.number().int().positive().default(5432),
    DATABASE_NAME: z.string().min(1),
    DATABASE_USER: z.string().min(1),
    DATABASE_PASSWORD: z.string().min(1)
});

const parsedServerEnv = serverEnvSchema.parse(process.env);

export const serverEnv = {
    ...parsedServerEnv,
    BETTER_AUTH_URL: parsedServerEnv.BETTER_AUTH_URL ?? `http://localhost:${parsedServerEnv.PORT}`
};
export type ServerEnv = typeof serverEnv;
