/**
 * Utility functions for consistent error handling across the application
 */

export interface ApiError {
    response?: {
        data?: {
            message?: string;
            error?: string;
        };
        status?: number;
        statusText?: string;
    };
    message?: string;
}

/**
 * Normalize error objects to extract meaningful error messages
 */
export function normalizeError(error: unknown): ApiError {
    if (error instanceof Error) {
        return {
            message: error.message,
        };
    }

    if (typeof error === 'object' && error !== null) {
        return error as ApiError;
    }

    return {
        message: 'An unknown error occurred',
    };
}

/**
 * Extract error message from various error formats
 */
export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {
    const normalizedError = normalizeError(error);

    return (
        normalizedError.response?.data?.message ||
        normalizedError.response?.data?.error ||
        normalizedError.message ||
        fallback
    );
}

/**
 * Type guard to check if error has response data
 */
export function hasResponseData(error: unknown): error is { response: { data: { message: string } } } {
    if (typeof error !== 'object' || error === null) {
        return false;
    }

    const errorObj = error as Record<string, unknown>;

    if (!('response' in errorObj) || typeof errorObj.response !== 'object' || errorObj.response === null) {
        return false;
    }

    const response = errorObj.response as Record<string, unknown>;

    if (!('data' in response) || typeof response.data !== 'object' || response.data === null) {
        return false;
    }

    const data = response.data as Record<string, unknown>;

    return 'message' in data && typeof data.message === 'string';
}

/**
 * Handle async operations with consistent error handling
 */
export async function handleAsyncOperation<T>(
    operation: () => Promise<T>,
    errorMessage = 'Operation failed'
): Promise<{ data?: T; error?: string }> {
    try {
        const data = await operation();
        return { data };
    } catch (error) {
        return { error: getErrorMessage(error, errorMessage) };
    }
}