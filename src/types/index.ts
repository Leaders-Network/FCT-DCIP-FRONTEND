/**
 * Central export file for all type definitions
 * This file re-exports all types from various type files for easy importing
 */

// API Types
export * from './api.types';
export * from './survey.types';
export * from './component.types';
export * from './utility.types';
export * from './common.types';

// Notification Types
export * from './notification.types';

// Error Types
export * from './error.types';

// Re-export commonly used React types
export type {
    ReactNode,
    ReactElement,
    FC,
    ComponentType,
    PropsWithChildren,
    MouseEvent,
    ChangeEvent,
    FormEvent,
    KeyboardEvent,
    FocusEvent,
} from 'react';

// Common type aliases for convenience
export type { FC as FunctionComponent } from 'react';

// Error handling types
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

// Form types
export interface FormState<T = Record<string, unknown>> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isSubmitting: boolean;
    isValid: boolean;
}

// Generic API response types
export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

export interface ErrorResponse {
    success: false;
    error: string;
    message: string;
    details?: Record<string, unknown>;
}

export type APIResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// Component prop types
export interface BaseComponentProps {
    className?: string;
    children?: ReactNode;
    id?: string;
    'data-testid'?: string;
}

// Event handler types
export type ClickHandler<T = HTMLElement> = (event: MouseEvent<T>) => void;
export type ChangeHandler<T = HTMLInputElement> = (event: ChangeEvent<T>) => void;
export type SubmitHandler<T = HTMLFormElement> = (event: FormEvent<T>) => void;

// Async function types
export type AsyncVoidFunction = () => Promise<void>;
export type AsyncFunction<T> = (...args: unknown[]) => Promise<T>;

// Status and state types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type RequestStatus = 'pending' | 'fulfilled' | 'rejected';

// Utility types for better type safety
export type NonEmptyArray<T> = [T, ...T[]];
export type AtLeastOne<T> = [T, ...T[]];

// Brand types for ID safety
export type Brand<K, T> = K & { __brand: T };
export type ID = Brand<string, 'ID'>;

// Type guards
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number => typeof value === 'number' && !isNaN(value);
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isArray = <T>(value: unknown): value is T[] => Array.isArray(value);
export const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
export const isDefined = <T>(value: T | null | undefined): value is T =>
    value !== null && value !== undefined;