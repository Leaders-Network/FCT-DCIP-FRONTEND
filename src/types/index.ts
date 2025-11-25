/**
 * Central type exports for the FCT-DCIP Frontend application
 * This file re-exports all types from various type definition files
 * to provide a single import point for type definitions
 */

// Export all API types
export * from './api.types';

// Export all component types
export * from './component.types';

// Export all survey types
export * from './survey.types';

// Export all utility types
export * from './utility.types';

// Type guards and utility functions
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number => typeof value === 'number';
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
export const isArray = <T = unknown>(value: unknown): value is T[] => Array.isArray(value);
export const isDefined = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;

// Common type aliases for better readability
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;
export type AsyncFunction<T = void> = () => Promise<T>;
export type VoidFunction = () => void;
export type Callback<T = void> = (value: T) => void;
export type AsyncCallback<T = void> = (value: T) => Promise<void>;

// React-specific type helpers
export type ReactChildren = React.ReactNode | React.ReactNode[];
export type ReactComponent<P = Record<string, unknown>> = React.FC<P> | React.ComponentType<P>;
export type ReactElement = React.ReactElement | null;

// Form-related types
export type FormValue = string | number | boolean | File | null | undefined;
export type FormValues = Record<string, FormValue>;
export type FormErrors = Record<string, string | undefined>;
export type FormTouched = Record<string, boolean>;

// API-related types
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type HTTPStatus = number;
export type APIEndpoint = string;

// Status types
export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';
export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

// Common entity types
export type EntityId = string;
export type Timestamp = string | Date;
export type ISODateString = string;

// Pagination types
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

// Filter types
export interface BaseFilters {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}

// Sort types
export interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}

// Selection types
export interface SelectOption<T = string> {
    value: T;
    label: string;
    disabled?: boolean;
    icon?: React.ComponentType<{ className?: string }>;
}

// Error types
export interface AppError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp?: string;
}

// Success response type
export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

// Error response type
export interface ErrorResponse {
    success: false;
    error: string;
    message: string;
    code?: string;
    details?: Record<string, unknown>;
}

// Union response type
export type APIResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// Type guard for success response
export const isSuccessResponse = <T>(response: APIResponse<T>): response is SuccessResponse<T> => {
    return response.success === true;
};

// Type guard for error response
export const isErrorResponse = <T>(response: APIResponse<T>): response is ErrorResponse => {
    return response.success === false;
};
