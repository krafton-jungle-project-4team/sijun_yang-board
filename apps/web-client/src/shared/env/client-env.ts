import { z } from "zod";

const clientEnvSchema = z.object({
    VITE_API_BASE_URL: z.string().default("/api")
});

export const clientEnv = clientEnvSchema.parse(import.meta.env);
