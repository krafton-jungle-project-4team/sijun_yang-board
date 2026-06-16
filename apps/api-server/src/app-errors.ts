export class AppError extends Error {
    public override readonly cause?: unknown;

    constructor(
        public readonly code: string,
        message: string,
        public readonly statusCode = 400,
        options?: ErrorOptions
    ) {
        super(message, options);
        this.cause = options?.cause;
    }
}
