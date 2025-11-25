/**
 * Type Guard Utilities
 * 
 * This file contains type guard functions to help with runtime type checking
 * and type narrowing in TypeScript.
 */

import {
    ApiResponse,
    ApiSuccessResponse,
    ApiErrorResponse,
} from '@/types/utility.types';
import {
    PolicyRequest,
    Assignment,
    DualAssignment,
    Surveyor,
    NIASurveyor,
    UserReport,
    ReportDetails
} from '@/types/api.types';

/**
 * Type guard to check if an API response is successful
 */
export function isApiSuccessResponse<T>(
    response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
    return response.success === true && 'data' in response;
}

/**
 * Type guard to check if an API response is an error
 */
export function isApiErrorResponse<T>(
    response: ApiResponse<T>
): response is ApiErrorResponse {
    return response.success === false && 'error' in response;
}

/**
 * Type guard to check if a value is a PolicyRequest object
 */
export function isPolicyRequest(value: unknown): value is PolicyRequest {
    return (
        typeof value === 'object' &&
        value !== null &&
        '_id' in value &&
        'userId' in value &&
        'propertyDetails' in value &&
        'contactDetails' in value
    );
}

/**
 * Type guard to check if a value is an Assignment object
 */
export function isAssignment(value: unknown): value is Assignment {
    return (
        typeof value === 'object' &&
        value !== null &&
        '_id' in value &&
        'ammcId' in value &&
        'surveyorId' in value &&
        'status' in value
    );
}

/**
 * Type guard to check if a value is a DualAssignment object
 */
export function isDualAssignment(value: unknown): value is DualAssignment {
    return (
        typeof value === 'object' &&
        value !== null &&
        '_id' in value &&
        'policyId' in value &&
        'assignmentStatus' in value &&
        'completionStatus' in value
    );
}

/**
 * Type guard to check if a value is a Surveyor object
 */
export function isSurveyor(value: unknown): value is Surveyor {
    return (
        typeof value === 'object' &&
        value !== null &&
        '_id' in value &&
        'firstname' in value &&
        'lastname' in value &&
        'email' in value
    );
}

/**
 * Type guard to check if a value is a NIASurveyor object
 */
export function isNIASurveyor(value: unknown): value is NIASurveyor {
    return (
        typeof value === 'object' &&
        value !== null &&
        '_id' in value &&
        'userId' in value &&
        'specialization' in value &&
        'status' in value
    );
}

/**
 * Type guard to check if a value is a UserReport object
 */
export function isUserReport(value: unknown): value is UserReport {
    return (
        typeof value === 'object' &&
        value !== null &&
        'reportId' in value &&
        'policyId' in value &&
        'status' in value
    );
}

/**
 * Type guard to check if a value is a ReportDetails object
 */
export function isReportDetails(value: unknown): value is ReportDetails {
    return (
        typeof value === 'object' &&
        value !== null &&
        'reportId' in value &&
        'propertyDetails' in value &&
        'reportSections' in value
    );
}

/**
 * Type guard to check if a value is a valid string
 */
export function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard to check if a value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Type guard to check if a value is a valid date string
 */
export function isValidDateString(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
}

/**
 * Type guard to check if a value is an array of a specific type
 */
export function isArrayOf<T>(
    value: unknown,
    guard: (item: unknown) => item is T
): value is T[] {
    return Array.isArray(value) && value.every(guard);
}

/**
 * Type guard to check if an object has a specific property
 */
export function hasProperty<K extends string>(
    obj: unknown,
    key: K
): obj is Record<K, unknown> {
    return typeof obj === 'object' && obj !== null && key in obj;
}

/**
 * Type guard to check if an object has multiple properties
 */
export function hasProperties<K extends string>(
    obj: unknown,
    keys: K[]
): obj is Record<K, unknown> {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        keys.every(key => key in obj)
    );
}

/**
 * Safely extract a property from an object with type checking
 */
export function safeGet<T, K extends keyof T>(
    obj: T | null | undefined,
    key: K
): T[K] | undefined {
    return obj?.[key];
}

/**
 * Safely extract nested properties with type checking
 */
export function safeGetNested<T>(
    obj: unknown,
    path: string
): T | undefined {
    if (typeof obj !== 'object' || obj === null) return undefined;

    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
        if (typeof current !== 'object' || current === null) {
            return undefined;
        }
        current = (current as Record<string, unknown>)[key];
    }

    return current as T | undefined;
}

/**
 * Type assertion with runtime validation
 */
export function assertType<T>(
    value: unknown,
    guard: (value: unknown) => value is T,
    errorMessage?: string
): asserts value is T {
    if (!guard(value)) {
        throw new TypeError(errorMessage || 'Type assertion failed');
    }
}

/**
 * Validate and narrow type with default fallback
 */
export function validateOrDefault<T>(
    value: unknown,
    guard: (value: unknown) => value is T,
    defaultValue: T
): T {
    return guard(value) ? value : defaultValue;
}

/**
 * Check if a value is null or undefined
 */
export function isNullish(value: unknown): value is null | undefined {
    return value === null || value === undefined;
}

/**
 * Check if a value is defined (not null or undefined)
 */
export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

/**
 * Filter out null and undefined values from an array
 */
export function filterDefined<T>(array: (T | null | undefined)[]): T[] {
    return array.filter(isDefined);
}

/**
 * Type guard for Error objects
 */
export function isError(value: unknown): value is Error {
    return value instanceof Error;
}

/**
 * Type guard for Promise objects
 */
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
    return (
        typeof value === 'object' &&
        value !== null &&
        'then' in value &&
        typeof (value as { then: unknown }).then === 'function'
    );
}

/**
 * Type guard for function
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
    return typeof value === 'function';
}

/**
 * Type guard for plain object (not array, not null)
 */
export function isPlainObject(value: unknown): value is Record<string, unknown> {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        Object.prototype.toString.call(value) === '[object Object]'
    );
}

// Export all type guards
export default {
    isApiSuccessResponse,
    isApiErrorResponse,
    isPolicyRequest,
    isAssignment,
    isDualAssignment,
    isSurveyor,
    isNIASurveyor,
    isUserReport,
    isReportDetails,
    isNonEmptyString,
    isValidNumber,
    isValidDateString,
    isArrayOf,
    hasProperty,
    hasProperties,
    safeGet,
    safeGetNested,
    assertType,
    validateOrDefault,
    isNullish,
    isDefined,
    filterDefined,
    isError,
    isPromise,
    isFunction,
    isPlainObject
};
