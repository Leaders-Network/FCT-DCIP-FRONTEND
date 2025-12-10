/**
 * Comprehensive error type definitions for the application
 */

// Base error interface
export interface BaseError {
    message: string;
    code?: string | number;
    timestamp?: string;
}

// API Error Response
export interface ApiErrorResponse {
    success: false;
    error: string;
    message: string;
    details?: Record<string, unknown>;
    statusCode?: number;
}

// HTTP Error with response data
export interface HttpError extends Error {
    response?: {
        data?: {
            message?: string;
            error?: string;
            details?: Record<string, unknown>;
        };
        status?: number;
        statusText?: string;
    };
    status?: number;
    statusCode?: number;
}

// Validation Error
export interface ValidationError extends BaseError {
    field: string;
    value?: unknown;
    constraints?: string[];
}

// Form Error State
export interface FormError {
    field: string;
    message: string;
}

// Error with response (for API calls)
export interface ErrorWithResponse {
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

// Network Error
export interface NetworkError extends BaseError {
    isNetworkError: true;
    timeout?: boolean;
    offline?: boolean;
}

// Authentication Error
export interface AuthError extends BaseError {
    isAuthError: true;
    expired?: boolean;
    unauthorized?: boolean;
}

// File Upload Error
export interface FileUploadError extends BaseError {
    file?: File;
    size?: number;
    type?: string;
}

// Generic Error Handler Result
export interface ErrorResult<T = unknown> {
    success: false;
    error: string;
    details?: T;
}

// Success Result
export interface SuccessResult<T = unknown> {
    success: true;
    data: T;
}

// Combined Result Type
export type Result<T = unknown> = SuccessResult<T> | ErrorResult;

// Error Severity Levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Error Categories
export type ErrorCategory =
    | 'network'
    | 'validation'
    | 'authentication'
    | 'authorization'
    | 'server'
    | 'client'
    | 'unknown';

// Structured Error
export interface StructuredError extends BaseError {
    category: ErrorCategory;
    severity: ErrorSeverity;
    context?: Record<string, unknown>;
    stack?: string;
}

// Error Handler Function Type
export type ErrorHandler<T = unknown> = (error: unknown) => T;

// Async Error Handler
export type AsyncErrorHandler<T = unknown> = (error: unknown) => Promise<T>;

// Error Boundary State
export interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: {
        componentStack: string;
    };
}

// Type Guards
export const isHttpError = (error: unknown): error is HttpError => {
    return error instanceof Error && 'response' in error;
};

export const isValidationError = (error: unknown): error is ValidationError => {
    return typeof error === 'object' &&
        error !== null &&
        'field' in error &&
        'message' in error;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
    return typeof error === 'object' &&
        error !== null &&
        'isNetworkError' in error;
};

export const isAuthError = (error: unknown): error is AuthError => {
    return typeof error === 'object' &&
        error !== null &&
        'isAuthError' in error;
};

// Error Utilities
export const createError = (
    message: string,
    category: ErrorCategory = 'unknown',
    severity: ErrorSeverity = 'medium'
): StructuredError => ({
    message,
    category,
    severity,
    timestamp: new Date().toISOString()
});

export const extractErrorMessage = (error: unknown): string => {
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    if (isHttpError(error)) {
        return error.response?.data?.message ||
            error.response?.data?.error ||
            error.message;
    }
    return 'An unknown error occurred';
};