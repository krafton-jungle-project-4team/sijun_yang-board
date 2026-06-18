import { connection, runSqldef } from "./schema-sync-utils.mjs";

const verbose = process.argv.includes("--verbose");

try {
    const result = runSqldef(connection(), ["--check"]);

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
