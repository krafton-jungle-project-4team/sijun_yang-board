import { z } from "zod";

import { loadEnvFile } from "./env-file";

loadEnvFile();

const serverEnvSchema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    PORT: z.coerce.number().int().positive(),
    WEB_ORIGIN: z.string().url(),
    BETTER_AUTH_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
    SESSION_COOKIE_NAME: z.string().min(1),
    DATABASE_HOST: z.string().min(1),
    DATABASE_PORT: z.coerce.number().int().positive(),
    DATABASE_NAME: z.string().min(1),
    DATABASE_USER: z.string().min(1),
    DATABASE_PASSWORD: z.string().min(1)
});

export const serverEnv = serverEnvSchema.parse(process.env);
export type ServerEnv = typeof serverEnv;
