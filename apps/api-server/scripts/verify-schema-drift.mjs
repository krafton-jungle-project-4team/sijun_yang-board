import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(scriptDir, "..");
const schemaFile = resolve(apiRoot, "database/schema.sql");
const snapshotFile = resolve(scriptDir, "schema-snapshot.sql");
const postgresImage = process.env.POSTGRES_IMAGE ?? "postgres:16-alpine";
const dockerHostAlias = "host.docker.internal";
const timeoutMs = 30_000;
const verbose = process.argv.includes("--verbose");

const requiredEnv = (name) => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`missing ${name}`);
    }

    return value;
};

const run = (args, options = {}) => {
    const result = spawnSync("docker", args, {
        encoding: "utf8",
        ...options
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        const detail = [result.stderr, result.stdout]
            .map((output) => output?.trim())
            .filter(Boolean)
            .join("\n");

        throw new Error(verbose && detail ? `docker command failed\n${detail}` : "docker command failed");
    }

    return result.stdout;
};

const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

const waitForPostgres = async (containerName) => {
    const deadline = Date.now() + timeoutMs;

    while (Date.now() < deadline) {
        const result = spawnSync("docker", ["exec", containerName, "pg_isready", "-U", "postgres", "-d", "postgres"], {
            encoding: "utf8"
        });

        if (result.status === 0) {
            return;
        }

        await sleep(200);
    }

    throw new Error("temporary PostgreSQL container did not become ready");
};

const normalize = (snapshot) =>
    `${snapshot
        .split("\n")
        .map((line) => line.trimEnd())
        .filter((line) => line !== "" && !line.startsWith("--"))
        .join("\n")}\n`;

const snapshotExpectedSchema = async (schemaSql, snapshotSql) => {
    const containerName = `nmm-schema-verify-${randomUUID().slice(0, 12)}`;

    run(["run", "--rm", "-d", "--name", containerName, "-e", "POSTGRES_PASSWORD=postgres", postgresImage]);

    try {
        await waitForPostgres(containerName);
        run(["exec", "-i", containerName, "psql", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", "postgres"], {
            input: schemaSql
        });

        return run([
            "exec",
            containerName,
            "psql",
            "-X",
            "-v",
            "ON_ERROR_STOP=1",
            "-A",
            "-t",
            "-U",
            "postgres",
            "-d",
            "postgres",
            "-c",
            snapshotSql
        ]);
    } finally {
        spawnSync("docker", ["stop", containerName], { encoding: "utf8" });
    }
};

const snapshotActualSchema = (snapshotSql) => {
    const pgHost = requiredEnv("PGHOST");
    const dockerHost = ["127.0.0.1", "localhost"].includes(pgHost) ? dockerHostAlias : pgHost;

    return run(
        [
            "run",
            "--rm",
            "-e",
            "PGPASSWORD",
            "-e",
            "PGSSLMODE",
            "--add-host",
            `${dockerHostAlias}:host-gateway`,
            postgresImage,
            "psql",
            "-X",
            "-v",
            "ON_ERROR_STOP=1",
            "-A",
            "-t",
            "-h",
            dockerHost,
            "-p",
            requiredEnv("PGPORT"),
            "-U",
            requiredEnv("PGUSER"),
            "-d",
            requiredEnv("PGDATABASE"),
            "-c",
            snapshotSql
        ],
        {
            env: {
                ...process.env,
                PGPASSWORD: requiredEnv("PGPASSWORD"),
                PGSSLMODE: process.env.PGSSLMODE ?? "disable"
            }
        }
    );
};

try {
    const schemaSql = readFileSync(schemaFile, "utf8");
    const snapshotSql = readFileSync(snapshotFile, "utf8");
    const expected = normalize(await snapshotExpectedSchema(schemaSql, snapshotSql));
    const actual = normalize(snapshotActualSchema(snapshotSql));

    if (expected !== actual) {
        throw new Error("schema drift detected");
    }

    console.log("db:verify passed");
} catch (error) {
    console.error(`db:verify failed: ${error.message}`);
    process.exitCode = 1;
}
