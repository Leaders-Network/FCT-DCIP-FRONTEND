/**
 * Central type exports for the FCT-DCIP Frontend application
 * This file re-exports all types for easier importing
 */

// API Types
export * from './api.types';

// Component Types
export * from './component.types';

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// React component types
export type FC<P = {}> = React.FunctionComponent<P>;
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

// Event types
export type ChangeEvent<T = HTMLInputElement> = React.ChangeEvent<T>;
export type ClickEvent<T = HTMLButtonElement> = React.MouseEvent<T>;
export type FormEvent<T = HTMLFormElement> = React.FormEvent<T>;
export type KeyboardEvent<T = HTMLElement> = React.KeyboardEvent<T>;

// Common prop types
export interface WithClassName {
    className?: string;
}

export interface WithChildren {
    children?: React.ReactNode;
}

export interface WithTestId {
    'data-testid'?: string;
}

// Base component props
export interface BaseProps extends WithClassName, WithChildren, WithTestId { }

// Loading states
export type AsyncState<T, E = Error> =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: T }
    | { status: 'error'; error: E };

// Form validation
export interface ValidationRule<T = unknown> {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: T) => string | null;
}

export interface FormField<T = unknown> {
    value: T;
    error: string | null;
    touched: boolean;
    rules?: ValidationRule<T>[];
}

// API response helpers
export type ApiSuccess<T> = { success: true; data: T; message?: string };
export type ApiError = { success: false; error: string; message: string };
export type ApiResult<T> = ApiSuccess<T> | ApiError;

// Pagination helpers
export interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

// Sort helpers
export type SortDirection = 'asc' | 'desc';
export interface SortConfig {
    field: string;
    direction: SortDirection;
}

// Filter helpers
export type FilterValue = string | number | boolean | null;
export type FilterConfig = Record<string, FilterValue>;

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';

// Responsive breakpoints
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Animation states
export type AnimationState = 'enter' | 'exit' | 'idle';

// Modal states
export type ModalState = 'closed' | 'opening' | 'open' | 'closing';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';

// File types
export interface FileWithPreview extends File {
    preview?: string;
}

// Geolocation types
export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface Location extends Coordinates {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}

// Time and date helpers
export type TimeFormat = '12h' | '24h';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

// Currency types
export type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP';

// Language types
export type Language = 'en' | 'fr' | 'ha' | 'ig' | 'yo';

// User preferences
export interface UserPreferences {
    theme: ThemeMode;
    language: Language;
    currency: Currency;
    dateFormat: DateFormat;
    timeFormat: TimeFormat;
    notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
    };
}

// Error boundary types
export interface ErrorInfo {
    componentStack: string;
    errorBoundary?: string;
    eventType?: string;
}

export interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

// Performance monitoring
export interface PerformanceMetric {
    name: string;
    value: number;
    unit: 'ms' | 'bytes' | 'count';
    timestamp: number;
}

// Feature flags
export type FeatureFlag =
    | 'dual-surveyor-system'
    | 'payment-integration'
    | 'real-time-notifications'
    | 'advanced-analytics'
    | 'mobile-app-support';

export interface FeatureFlags {
    [key: string]: boolean;
}

// Environment types
export type Environment = 'development' | 'staging' | 'production';

// Build info
export interface BuildInfo {
    version: string;
    buildDate: string;
    commitHash: string;
    environment: Environment;
}

// Type guards
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number => typeof value === 'number' && !isNaN(value);
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
export const isArray = <T>(value: unknown): value is T[] => Array.isArray(value);
export const isFunction = (value: unknown): value is Function => typeof value === 'function';
export const isDefined = <T>(value: T | undefined): value is T => value !== undefined;
export const isNotNull = <T>(value: T | null): value is T => value !== null;
export const isNotEmpty = (value: string | unknown[] | null | undefined): boolean =>
    value !== null && value !== undefined && value.length > 0;

// Utility functions for type safety
export const assertNever = (value: never): never => {
    throw new Error(`Unexpected value: ${value}`);
};

export const exhaustiveCheck = (value: never): never => {
    throw new Error(`Exhaustive check failed. Received: ${value}`);
};