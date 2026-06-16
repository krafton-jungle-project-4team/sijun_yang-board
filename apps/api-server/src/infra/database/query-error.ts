export type QueryErrorConstructor<TError extends Error = Error> = abstract new (...args: never[]) => TError;

export interface QueryErrorPredicateMatcher<TError extends Error = Error> {
    matches: (error: unknown) => error is TError;
}

export type QueryErrorMatcher<TError extends Error = Error> =
    | QueryErrorConstructor<TError>
    | QueryErrorPredicateMatcher<TError>
    | string;

export type QueryErrorFactory<TError extends Error = Error> = (error: TError) => Error;

export type QueryErrorMapping<TError extends Error = Error> = readonly [
    matcher: QueryErrorMatcher<TError>,
    errorFactory: QueryErrorFactory<TError>
];

export type QueryErrorTranslator = (error: unknown) => unknown;

export interface QueryPromise<TResult, TDefaultError extends Error = Error> extends Promise<TResult> {
    mapErr: {
        (errorFactory: QueryErrorFactory<TDefaultError>): QueryPromise<TResult, TDefaultError>;
        <TError extends Error>(mapping: QueryErrorMapping<TError>): QueryPromise<TResult, TDefaultError>;
        <TError1 extends Error, TError2 extends Error>(
            mapping1: QueryErrorMapping<TError1>,
            mapping2: QueryErrorMapping<TError2>
        ): QueryPromise<TResult, TDefaultError>;
        <TError1 extends Error, TError2 extends Error, TError3 extends Error>(
            mapping1: QueryErrorMapping<TError1>,
            mapping2: QueryErrorMapping<TError2>,
            mapping3: QueryErrorMapping<TError3>
        ): QueryPromise<TResult, TDefaultError>;
        <TError1 extends Error, TError2 extends Error, TError3 extends Error, TError4 extends Error>(
            mapping1: QueryErrorMapping<TError1>,
            mapping2: QueryErrorMapping<TError2>,
            mapping3: QueryErrorMapping<TError3>,
            mapping4: QueryErrorMapping<TError4>
        ): QueryPromise<TResult, TDefaultError>;
        <
            TError1 extends Error,
            TError2 extends Error,
            TError3 extends Error,
            TError4 extends Error,
            TError5 extends Error
        >(
            mapping1: QueryErrorMapping<TError1>,
            mapping2: QueryErrorMapping<TError2>,
            mapping3: QueryErrorMapping<TError3>,
            mapping4: QueryErrorMapping<TError4>,
            mapping5: QueryErrorMapping<TError5>
        ): QueryPromise<TResult, TDefaultError>;
    };
}

interface QueryPromiseOptions<TDefaultError extends Error = Error> {
    defaultMapErrMatcher?: QueryErrorMatcher<TDefaultError>;
    translateError?: QueryErrorTranslator;
}

type NormalizedQueryErrorMapping = readonly [matcher: QueryErrorMatcher, errorFactory: (error: Error) => Error];

export function createQueryPromise<TResult, TDefaultError extends Error = Error>(
    callback: () => Promise<TResult>,
    options: QueryPromiseOptions<TDefaultError> = {}
): QueryPromise<TResult, TDefaultError> {
    const translateError = options.translateError ?? keepError;
    const defaultMapErrMatcher = options.defaultMapErrMatcher ?? (Error as unknown as QueryErrorMatcher<TDefaultError>);
    const promise = callback().catch((error) => {
        throw translateError(error);
    }) as QueryPromise<TResult, TDefaultError>;

    promise.mapErr = ((...args: [QueryErrorFactory<TDefaultError>] | QueryErrorMapping[]) => {
        const mappings = normalizeErrorMappings(args, defaultMapErrMatcher);

        return createQueryPromise(
            async () => {
                try {
                    return await promise;
                } catch (error) {
                    const mappedError = getMappedError(error, mappings);

                    if (mappedError) {
                        throw mappedError;
                    }

                    throw error;
                }
            },
            { defaultMapErrMatcher, translateError: keepError }
        );
    }) as QueryPromise<TResult, TDefaultError>["mapErr"];

    return promise;
}

function normalizeErrorMappings<TDefaultError extends Error>(
    args: [QueryErrorFactory<TDefaultError>] | QueryErrorMapping[],
    defaultMatcher: QueryErrorMatcher<TDefaultError>
): NormalizedQueryErrorMapping[] {
    const [firstArg] = args;

    if (typeof firstArg === "function") {
        return [[defaultMatcher, firstArg as unknown as (error: Error) => Error]];
    }

    return args as unknown as NormalizedQueryErrorMapping[];
}

function getMappedError(error: unknown, mappings: NormalizedQueryErrorMapping[]) {
    for (const [matcher, errorFactory] of mappings) {
        if (matchesError(error, matcher)) {
            return errorFactory(error as Error);
        }
    }

    return null;
}

function matchesError(error: unknown, matcher: QueryErrorMatcher) {
    if (typeof matcher === "string") {
        return getErrorName(error) === matcher;
    }

    if ("matches" in matcher) {
        return matcher.matches(error);
    }

    return error instanceof matcher;
}

function getErrorName(error: unknown) {
    if (error instanceof Error) {
        return error.name;
    }

    return typeof error;
}

function keepError(error: unknown) {
    return error;
}
