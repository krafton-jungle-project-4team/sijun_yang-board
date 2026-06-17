import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(scriptDir, "..");
const schemaFile = resolve(apiRoot, "database/schema.sql");
const sqldefImage = process.env.SQLDEF_IMAGE ?? "sqldef/psqldef";
const dockerHostAlias = "host.docker.internal";
const verbose = process.argv.includes("--verbose");

const requiredEnv = (name) => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`missing ${name}`);
    }

    return value;
};

const sqldefArgs = () => {
    const pgHost = requiredEnv("PGHOST");
    const dockerHost = ["127.0.0.1", "localhost"].includes(pgHost) ? dockerHostAlias : pgHost;

    return [
        "run",
        "--rm",
        "-i",
        "-e",
        "PGPASSWORD",
        "-e",
        "PGSSLMODE",
        "--add-host",
        `${dockerHostAlias}:host-gateway`,
        sqldefImage,
        "-h",
        dockerHost,
        "-p",
        requiredEnv("PGPORT"),
        "-U",
        requiredEnv("PGUSER"),
        requiredEnv("PGDATABASE"),
        "--check"
    ];
};

try {
    const schemaSql = readFileSync(schemaFile, "utf8");
    const result = spawnSync("docker", sqldefArgs(), {
        encoding: "utf8",
        env: {
            ...process.env,
            PGPASSWORD: requiredEnv("PGPASSWORD"),
            PGSSLMODE: process.env.PGSSLMODE ?? "disable"
        },
        input: schemaSql
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status === 0) {
        console.log("db:verify passed");
    } else if (result.status === 2) {
        if (verbose) {
            process.stderr.write(result.stdout);
            process.stderr.write(result.stderr);
        }

        console.error("db:verify failed: schema drift detected");
        process.exitCode = result.status;
    } else {
        if (verbose) {
            process.stderr.write(result.stdout);
            process.stderr.write(result.stderr);
        }

        console.error("db:verify failed: sqldef command failed");
        process.exitCode = result.status ?? 1;
    }
} catch (error) {
    console.error(`db:verify failed: ${error.message}`);
    process.exitCode = 1;
}
