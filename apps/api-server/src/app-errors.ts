/**
 * 도메인 실패를 위한 안정적인 API 오류 코드, 사용자 메시지, HTTP 상태를 담는다.
 *
 * 서비스나 인프라 코드가 전역 API envelope로 제어된 실패를 반환해야 할 때 사용한다.
 * 예상하지 못한 프로그래밍 오류는 native error로 두어 exception filter가 서버 오류로 처리하게 한다.
 */
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

export type DomainErrorDefinition = {
    readonly statusCode: number;
    readonly code: string;
    readonly message: string;
};

export function createDomainError(error: DomainErrorDefinition, options?: ErrorOptions) {
    return new AppError(error.code, error.message, error.statusCode, options);
}
