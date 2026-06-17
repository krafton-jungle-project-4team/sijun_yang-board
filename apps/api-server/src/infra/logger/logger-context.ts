import { PinoLogger } from "nestjs-pino";

type LoggerContextFields = Record<string, boolean | number | string | null | undefined>;

export function assignLoggerContext(logger: PinoLogger, fields: LoggerContextFields) {
    const context = removeEmptyFields(fields);

    if (Object.keys(context).length === 0) {
        return;
    }

    try {
        logger.assign(context);
    } catch (error) {
        if (!isLoggerContextUnavailable(error)) {
            throw error;
        }
    }
}

function removeEmptyFields(fields: LoggerContextFields) {
    return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== null && value !== undefined));
}

function isLoggerContextUnavailable(error: unknown) {
    return error instanceof Error && error.message.includes("unable to assign extra fields out of request scope");
}
