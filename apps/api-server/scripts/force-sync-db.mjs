import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(scriptDir, "..");
const schemaFile = resolve(apiRoot, "database/schema.sql");
const postgresImage = process.env.POSTGRES_IMAGE ?? "postgres:16-alpine";
const sqldefImage = process.env.SQLDEF_IMAGE ?? "sqldef/psqldef";
const dockerHostAlias = "host.docker.internal";

const requiredEnv = (name) => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`missing ${name}`);
    }

    return value;
};

const connection = () => {
    const pgHost = requiredEnv("PGHOST");

    return {
        database: requiredEnv("PGDATABASE"),
        host: ["127.0.0.1", "localhost"].includes(pgHost) ? dockerHostAlias : pgHost,
        password: requiredEnv("PGPASSWORD"),
        port: requiredEnv("PGPORT"),
        sslMode: process.env.PGSSLMODE ?? "disable",
        user: requiredEnv("PGUSER")
    };
};

const dockerEnv = (db) => ({
    ...process.env,
    PGPASSWORD: db.password,
    PGSSLMODE: db.sslMode
});

const runPsql = (db, sql) => {
    const result = spawnSync(
        "docker",
        [
            "run",
            "--rm",
            "-i",
            "-e",
            "PGPASSWORD",
            "-e",
            "PGSSLMODE",
            "--add-host",
            `${dockerHostAlias}:host-gateway`,
            postgresImage,
            "psql",
            "-v",
            "ON_ERROR_STOP=1",
            "-h",
            db.host,
            "-p",
            db.port,
            "-U",
            db.user,
            "-d",
            db.database
        ],
        {
            encoding: "utf8",
            env: dockerEnv(db),
            input: sql
        }
    );

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(result.stderr.trim() || "psql command failed");
    }
};

const sqldefArgs = (db) => {
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
        db.host,
        "-p",
        db.port,
        "-U",
        db.user,
        db.database,
        "--apply",
        "--enable-drop"
    ];
};

try {
    const db = connection();
    const schemaSql = readFileSync(schemaFile, "utf8");

    console.log("db:forcesync applies schema.sql with sqldef --apply --enable-drop.");
    console.log("db:forcesync may drop PostgreSQL schema objects and clears sessions.");

    runPsql(
        db,
        `DROP TABLE IF EXISTS "session", sessions CASCADE;
`
    );

    const result = spawnSync("docker", sqldefArgs(db), {
        encoding: "utf8",
        env: dockerEnv(db),
        input: schemaSql
    });

    if (result.error) {
        throw result.error;
    }

    if (result.status !== 0) {
        throw new Error(result.stderr.trim() || "sqldef command failed");
    }

    if (result.stdout.trim()) {
        console.log(result.stdout.trim());
    }

    console.log("db:forcesync passed");
} catch (error) {
    console.error(`db:forcesync failed: ${error.message}`);
    process.exitCode = 1;
}
