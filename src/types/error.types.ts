/**
 * Error handling type definitions
 */

// Base error interface
export interface BaseError {
    message: string;
    code?: string;
    timestamp?: string;
}

// API Error interface
export interface ApiError extends BaseError {
    status?: number;
    statusText?: string;
    endpoint?: string;
    method?: string;
    details?: Record<string, unknown>;
}

// Validation Error interface
export interface ValidationError extends BaseError {
    field?: string;
    value?: unknown;
    constraint?: string;
}

// Network Error interface
export interface NetworkError extends BaseError {
    isNetworkError: true;
    timeout?: boolean;
    offline?: boolean;
}

// Authentication Error interface
export interface AuthError extends BaseError {
    isAuthError: true;
    tokenExpired?: boolean;
    invalidCredentials?: boolean;
    insufficientPermissions?: boolean;
}

// File Upload Error interface
export interface FileUploadError extends BaseError {
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    maxSize?: number;
    allowedTypes?: string[];
}

// Form Error interface
export interface FormError extends BaseError {
    field: string;
    value?: unknown;
    type: 'required' | 'invalid' | 'min' | 'max' | 'pattern' | 'custom';
}

// Error Handler function type
export type ErrorHandler = (error: BaseError) => void;

// Error Recovery function type
export type ErrorRecovery = () => void | Promise<void>;

// Error Boundary State
export interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: React.ErrorInfo;
}

// Error Context
export interface ErrorContext {
    errors: BaseError[];
    addError: (error: BaseError) => void;
    removeError: (index: number) => void;
    clearErrors: () => void;
    hasErrors: boolean;
}

// Error Notification
export interface ErrorNotification {
    id: string;
    error: BaseError;
    severity: 'low' | 'medium' | 'high' | 'critical';
    dismissible: boolean;
    autoHide?: boolean;
    duration?: number;
}

// Error Log Entry
export interface ErrorLogEntry {
    id: string;
    error: BaseError;
    timestamp: string;
    userId?: string;
    sessionId?: string;
    userAgent?: string;
    url?: string;
    stackTrace?: string;
}

// Error Response from API
export interface ErrorResponse {
    success: false;
    error: string;
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    timestamp?: string;
}

// Success Response from API
export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
    timestamp?: string;
}

// Union type for API responses
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// Error handling utilities
export const createApiError = (
    message: string,
    status?: number,
    endpoint?: string,
    method?: string
): ApiError => ({
    message,
    status,
    endpoint,
    method,
    code: `API_ERROR_${status}`,
    timestamp: new Date().toISOString()
});

export const createValidationError = (
    field: string,
    message: string,
    value?: unknown
): ValidationError => ({
    message,
    field,
    value,
    code: 'VALIDATION_ERROR',
    timestamp: new Date().toISOString()
});

export const createNetworkError = (
    message: string,
    timeout = false,
    offline = false
): NetworkError => ({
    message,
    isNetworkError: true,
    timeout,
    offline,
    code: 'NETWORK_ERROR',
    timestamp: new Date().toISOString()
});

export const createAuthError = (
    message: string,
    tokenExpired = false,
    invalidCredentials = false,
    insufficientPermissions = false
): AuthError => ({
    message,
    isAuthError: true,
    tokenExpired,
    invalidCredentials,
    insufficientPermissions,
    code: 'AUTH_ERROR',
    timestamp: new Date().toISOString()
});

export const isApiError = (error: unknown): error is ApiError => {
    return typeof error === 'object' && error !== null && 'status' in error;
};

export const isValidationError = (error: unknown): error is ValidationError => {
    return typeof error === 'object' && error !== null && 'field' in error;
};

export const isNetworkError = (error: unknown): error is NetworkError => {
    return typeof error === 'object' && error !== null && 'isNetworkError' in error;
};

export const isAuthError = (error: unknown): error is AuthError => {
    return typeof error === 'object' && error !== null && 'isAuthError' in error;
};