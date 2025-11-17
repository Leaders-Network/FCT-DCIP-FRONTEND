/**
 * Error handling utilities for the FCT-DCIP application
 */

import { AppError, ValidationError, NetworkError, ServerError } from '@/types/api.types';

/**
 * Type guard to check if error is a ValidationError
 */
export const isValidationError = (error: AppError): error is ValidationError => {
    return 'field' in error;
};

/**
 * Type guard to check if error is a NetworkError
 */
export const isNetworkError = (error: AppError): error is NetworkError => {
    return 'type' in error && error.type === 'network';
};

/**
 * Type guard to check if error is a ServerError
 */
export const isServerError = (error: AppError): error is ServerError => {
    return 'type' in error && error.type === 'server';
};

/**
 * Convert unknown error to AppError
 */
export const normalizeError = (error: unknown): AppError => {
    if (error instanceof Error) {
        // Check if it's a network error
        if (error.message.includes('fetch') || error.message.includes('network')) {
            return {
                type: 'network',
                message: error.message
            } as NetworkError;
        }

        // Default to server error
        return {
            type: 'server',
            message: error.message
        } as ServerError;
    }

    if (typeof error === 'string') {
        return {
            type: 'server',
            message: error
        } as ServerError;
    }

    // Handle API error responses
    if (typeof error === 'object' && error !== null) {
        const errorObj = error as Record<string, unknown>;

        if (errorObj.field && errorObj.message) {
            return {
                field: String(errorObj.field),
                message: String(errorObj.message),
                code: errorObj.code ? String(errorObj.code) : undefined
            } as ValidationError;
        }

        if (errorObj.status && errorObj.statusText) {
            return {
                type: 'network',
                message: String(errorObj.statusText || 'Network error'),
                status: Number(errorObj.status),
                statusText: String(errorObj.statusText)
            } as NetworkError;
        }

        return {
            type: 'server',
            message: String(errorObj.message || 'Unknown server error'),
            code: errorObj.code ? String(errorObj.code) : undefined,
            details: errorObj
        } as ServerError;
    }

    return {
        type: 'server',
        message: 'Unknown error occurred'
    } as ServerError;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: AppError): string => {
    if (isValidationError(error)) {
        return `${error.field}: ${error.message}`;
    }

    if (isNetworkError(error)) {
        if (error.status === 401) {
            return 'Authentication required. Please log in again.';
        }
        if (error.status === 403) {
            return 'You do not have permission to perform this action.';
        }
        if (error.status === 404) {
            return 'The requested resource was not found.';
        }
        if (error.status === 500) {
            return 'Server error. Please try again later.';
        }
        return error.message || 'Network error occurred';
    }

    if (isServerError(error)) {
        return error.message || 'Server error occurred';
    }

    return 'An unexpected error occurred';
};

/**
 * Handle API errors with proper typing
 */
export const handleApiError = (error: unknown): never => {
    const normalizedError = normalizeError(error);
    const message = getErrorMessage(normalizedError);

    console.error('API Error:', normalizedError);
    throw new Error(message);
};

/**
 * Async error wrapper for better error handling
 */
export const withErrorHandling = <T extends unknown[], R>(
    fn: (...args: T) => Promise<R>
) => {
    return async (...args: T): Promise<R> => {
        try {
            return await fn(...args);
        } catch (error) {
            handleApiError(error);
            throw error; // Re-throw after handling
        }
    };
};

/**
 * Safe async function execution with error handling
 */
export const safeAsync = async <T>(
    fn: () => Promise<T>,
    fallback?: T
): Promise<T | undefined> => {
    try {
        return await fn();
    } catch (error) {
        console.error('Safe async error:', normalizeError(error));
        return fallback;
    }
};

/**
 * Retry function with exponential backoff
 */
export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            if (attempt === maxRetries) {
                break;
            }

            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    handleApiError(lastError);
    throw lastError; // Throw after all retries exhausted
};