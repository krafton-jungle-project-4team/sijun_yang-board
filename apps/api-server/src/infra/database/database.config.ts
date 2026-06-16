import type { PoolConfig } from "pg";

import { serverEnv } from "../env";

export const databaseConfig: PoolConfig = {
    host: serverEnv.DATABASE_HOST,
    port: serverEnv.DATABASE_PORT,
    user: serverEnv.DATABASE_USER,
    password: serverEnv.DATABASE_PASSWORD,
    database: serverEnv.DATABASE_NAME
};
