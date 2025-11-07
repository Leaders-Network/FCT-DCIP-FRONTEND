/**
 * Type Validation Utilities
 * Runtime validation helpers for TypeScript types
 */

import type { ApiResponse, ApiError } from '@/types/utility.types';

// ============================================================================
// API Response Validators
// ============================================================================

/**
 * Type guard for successful API response
 */
export const isSuccessResponse = <T>(
    response: ApiResponse<T> | ApiError
): response is ApiResponse<T> & { success: true; data: T } => {
    return response.success === true && 'data' in response && response.data !== undefined;
};

/**
 * Type guard for error API response
 */
export const isErrorResponse = (
    response: ApiResponse<unknown> | ApiError
): response is ApiError => {
    return response.success === false && 'error' in response;
};

/**
 * Validate and extract data from API response
 * Throws error if response is not successful
 */
export const extractApiData = <T>(response: ApiResponse<T> | ApiError): T => {
    if (isSuccessResponse(response)) {
        return response.data;
    }

    const errorMessage = isErrorResponse(response)
        ? response.error
        : 'Unknown API error';

    throw new Error(errorMessage);
};

/**
 * Safely extract data from API response
 * Returns null if response is not successful
 */
export const safeExtractApiData = <T>(response: ApiResponse<T> | ApiError): T | null => {
    if (isSuccessResponse(response)) {
        return response.data;
    }
    return null;
};

// ============================================================================
// Type Validators
// ============================================================================

/**
 * Validate that value is a non-empty string
 */
export const isNonEmptyString = (value: unknown): value is string => {
    return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validate that value is a valid email
 */
export const isValidEmail = (value: unknown): value is string => {
    if (!isNonEmptyString(value)) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
};

/**
 * Validate that value is a valid phone number
 */
export const isValidPhone = (value: unknown): value is string => {
    if (!isNonEmptyString(value)) return false;
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
};

/**
 * Validate that value is a positive number
 */
export const isPositiveNumber = (value: unknown): value is number => {
    return typeof value === 'number' && !isNaN(value) && value > 0;
};

/**
 * Validate that value is a non-negative number
 */
export const isNonNegativeNumber = (value: unknown): value is number => {
    return typeof value === 'number' && !isNaN(value) && value >= 0;
};

/**
 * Validate that value is within range
 */
export const isInRange = (value: unknown, min: number, max: number): value is number => {
    return typeof value === 'number' && !isNaN(value) && value >= min && value <= max;
};

/**
 * Validate that value is a valid date
 */
export const isValidDate = (value: unknown): value is Date => {
    return value instanceof Date && !isNaN(value.getTime());
};

/**
 * Validate that value is a valid ISO date string
 */
export const isValidISODate = (value: unknown): value is string => {
    if (!isNonEmptyString(value)) return false;
    const date = new Date(value);
    return isValidDate(date);
};

/**
 * Validate that value is a valid URL
 */
export const isValidUrl = (value: unknown): value is string => {
    if (!isNonEmptyString(value)) return false;
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

/**
 * Validate that value is one of the allowed values
 */
export const isOneOf = <T>(value: unknown, allowedValues: readonly T[]): value is T => {
    return allowedValues.includes(value as T);
};

/**
 * Validate that array contains only specific type
 */
export const isArrayOf = <T>(
    value: unknown,
    validator: (item: unknown) => item is T
): value is T[] => {
    return Array.isArray(value) && value.every(validator);
};

/**
 * Validate that object has required keys
 */
export const hasRequiredKeys = <T extends string>(
    value: unknown,
    keys: readonly T[]
): value is Record<T, unknown> => {
    if (typeof value !== 'object' || value === null) return false;
    return keys.every(key => key in value);
};

// ============================================================================
// Object Validators
// ============================================================================

/**
 * Validate that value is a plain object
 */
export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        Object.prototype.toString.call(value) === '[object Object]'
    );
};

/**
 * Validate that object is not empty
 */
export const isNonEmptyObject = (value: unknown): value is Record<string, unknown> => {
    return isPlainObject(value) && Object.keys(value).length > 0;
};

/**
 * Deep equality check
 */
export const deepEqual = (a: unknown, b: unknown): boolean => {
    if (a === b) return true;

    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
        return false;
    }

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!keysB.includes(key)) return false;
        if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
            return false;
        }
    }

    return true;
};

// ============================================================================
// Null/Undefined Validators
// ============================================================================

/**
 * Check if value is null or undefined
 */
export const isNullish = (value: unknown): value is null | undefined => {
    return value === null || value === undefined;
};

/**
 * Check if value is defined (not null or undefined)
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
    return !isNullish(value);
};

/**
 * Assert that value is defined, throw error if not
 */
export const assertDefined = <T>(
    value: T | null | undefined,
    message = 'Value is null or undefined'
): asserts value is T => {
    if (isNullish(value)) {
        throw new Error(message);
    }
};

/**
 * Get value or default if nullish
 */
export const getOrDefault = <T>(value: T | null | undefined, defaultValue: T): T => {
    return isDefined(value) ? value : defaultValue;
};

// ============================================================================
// Form Validation Helpers
// ============================================================================

/**
 * Validate required field
 */
export const validateRequired = (value: unknown): string | null => {
    if (isNullish(value)) return 'This field is required';
    if (typeof value === 'string' && value.trim().length === 0) {
        return 'This field is required';
    }
    return null;
};

/**
 * Validate email field
 */
export const validateEmail = (value: unknown): string | null => {
    const requiredError = validateRequired(value);
    if (requiredError) return requiredError;

    if (!isValidEmail(value)) {
        return 'Please enter a valid email address';
    }
    return null;
};

/**
 * Validate phone field
 */
export const validatePhone = (value: unknown): string | null => {
    const requiredError = validateRequired(value);
    if (requiredError) return requiredError;

    if (!isValidPhone(value)) {
        return 'Please enter a valid phone number';
    }
    return null;
};

/**
 * Validate minimum length
 */
export const validateMinLength = (value: unknown, minLength: number): string | null => {
    if (!isNonEmptyString(value)) return 'This field is required';

    if (value.length < minLength) {
        return `Must be at least ${minLength} characters`;
    }
    return null;
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (value: unknown, maxLength: number): string | null => {
    if (!isNonEmptyString(value)) return null;

    if (value.length > maxLength) {
        return `Must be no more than ${maxLength} characters`;
    }
    return null;
};

/**
 * Validate number range
 */
export const validateRange = (
    value: unknown,
    min: number,
    max: number
): string | null => {
    if (!isPositiveNumber(value)) {
        return 'Please enter a valid number';
    }

    if (!isInRange(value, min, max)) {
        return `Must be between ${min} and ${max}`;
    }
    return null;
};

/**
 * Validate date is in the future
 */
export const validateFutureDate = (value: unknown): string | null => {
    if (!isValidISODate(value)) {
        return 'Please enter a valid date';
    }

    const date = new Date(value);
    const now = new Date();

    if (date <= now) {
        return 'Date must be in the future';
    }
    return null;
};

/**
 * Validate date is in the past
 */
export const validatePastDate = (value: unknown): string | null => {
    if (!isValidISODate(value)) {
        return 'Please enter a valid date';
    }

    const date = new Date(value);
    const now = new Date();

    if (date >= now) {
        return 'Date must be in the past';
    }
    return null;
};

// ============================================================================
// Composite Validators
// ============================================================================

/**
 * Combine multiple validators
 */
export const combineValidators = <T>(
    ...validators: Array<(value: T) => string | null>
) => {
    return (value: T): string | null => {
        for (const validator of validators) {
            const error = validator(value);
            if (error) return error;
        }
        return null;
    };
};

/**
 * Create conditional validator
 */
export const conditionalValidator = <T>(
    condition: (value: T) => boolean,
    validator: (value: T) => string | null
) => {
    return (value: T): string | null => {
        if (condition(value)) {
            return validator(value);
        }
        return null;
    };
};

// ============================================================================
// Type Assertion Helpers
// ============================================================================

/**
 * Assert that value is of specific type
 */
export const assertType = <T>(
    value: unknown,
    validator: (value: unknown) => value is T,
    message = 'Type assertion failed'
): asserts value is T => {
    if (!validator(value)) {
        throw new TypeError(message);
    }
};

/**
 * Cast value to type with validation
 */
export const safeCast = <T>(
    value: unknown,
    validator: (value: unknown) => value is T
): T | null => {
    return validator(value) ? value : null;
};

/**
 * Cast value to type with validation, throw on failure
 */
export const strictCast = <T>(
    value: unknown,
    validator: (value: unknown) => value is T,
    message = 'Type cast failed'
): T => {
    if (!validator(value)) {
        throw new TypeError(message);
    }
    return value;
};

// ============================================================================
// Export all validators
// ============================================================================

export const validators = {
    // API
    isSuccessResponse,
    isErrorResponse,
    extractApiData,
    safeExtractApiData,

    // Basic types
    isNonEmptyString,
    isValidEmail,
    isValidPhone,
    isPositiveNumber,
    isNonNegativeNumber,
    isInRange,
    isValidDate,
    isValidISODate,
    isValidUrl,
    isOneOf,
    isArrayOf,
    hasRequiredKeys,

    // Objects
    isPlainObject,
    isNonEmptyObject,
    deepEqual,

    // Null/Undefined
    isNullish,
    isDefined,
    assertDefined,
    getOrDefault,

    // Form validation
    validateRequired,
    validateEmail,
    validatePhone,
    validateMinLength,
    validateMaxLength,
    validateRange,
    validateFutureDate,
    validatePastDate,

    // Composite
    combineValidators,
    conditionalValidator,

    // Type assertions
    assertType,
    safeCast,
    strictCast,
};

export default validators;
