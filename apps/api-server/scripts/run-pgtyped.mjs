import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { config } from "dotenv";

const workspaceRoot = resolve(import.meta.dirname, "../../..");
const envPath = resolve(workspaceRoot, "apps/api-server/.env");

if (existsSync(envPath)) {
    config({ path: envPath });
}

const databaseHost =
    process.env.PGTYPED_DATABASE_HOST ??
    (process.env.DATABASE_HOST === "postgres" ? "127.0.0.1" : process.env.DATABASE_HOST);

const env = {
    ...process.env,
    PGHOST: process.env.PGHOST ?? databaseHost,
    PGPORT: process.env.PGPORT ?? process.env.POSTGRES_PORT ?? process.env.DATABASE_PORT,
    PGDATABASE: process.env.PGDATABASE ?? process.env.DATABASE_NAME,
    PGUSER: process.env.PGUSER ?? process.env.DATABASE_USER,
    PGPASSWORD: process.env.PGPASSWORD ?? process.env.DATABASE_PASSWORD
};

const cliEntry = resolve(workspaceRoot, "node_modules/@pgtyped/cli/lib/index.js");
const result = spawnSync(process.execPath, [cliEntry, "-c", "apps/api-server/pgtyped.config.json"], {
    cwd: workspaceRoot,
    env,
    stdio: "inherit"
});

if (result.error) {
    throw result.error;
}

if (result.status !== 0) {
    process.exit(result.status ?? 1);
}

const prettierEntry = resolve(workspaceRoot, "node_modules/prettier/bin/prettier.cjs");
const prettierResult = spawnSync(
    process.execPath,
    [prettierEntry, "--write", "apps/api-server/src/features/*/database/__generated__/*.queries.ts"],
    {
        cwd: workspaceRoot,
        stdio: "inherit"
    }
);

if (prettierResult.error) {
    throw prettierResult.error;
}

process.exit(prettierResult.status ?? 1);
