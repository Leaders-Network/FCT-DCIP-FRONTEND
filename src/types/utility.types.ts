/**
 * Utility Types for Type-Safe Development
 * Reusable type utilities for the FCT-DCIP application
 */

// ============================================================================
// Generic Utility Types
// ============================================================================

/**
 * Make specific properties of T optional
 * @example Optional<User, 'email' | 'phone'>
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specific properties of T required
 * @example RequiredFields<User, 'email' | 'phone'>
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Deep partial - makes all properties and nested properties optional
 * @example DeepPartial<ComplexObject>
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep required - makes all properties and nested properties required
 */
export type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Make all properties readonly recursively
 */
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Extract keys of T where the value type is V
 * @example KeysOfType<User, string> // 'name' | 'email'
 */
export type KeysOfType<T, V> = {
    [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

/**
 * Exclude keys of T where the value type is V
 */
export type ExcludeKeysOfType<T, V> = {
    [K in keyof T]: T[K] extends V ? never : K;
}[keyof T];

/**
 * Make properties nullable
 */
export type Nullable<T> = {
    [P in keyof T]: T[P] | null;
};

/**
 * Remove null and undefined from all properties
 */
export type NonNullableFields<T> = {
    [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Extract promise type
 * @example Awaited<Promise<string>> // string
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Function that returns a promise
 */
export type AsyncFunction<T = void> = (...args: unknown[]) => Promise<T>;

/**
 * Extract array element type
 * @example ArrayElement<string[]> // string
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// ============================================================================
// API-Specific Utility Types
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
    success: boolean;
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

/**
 * API error response
 */
export interface ApiError {
    success: false;
    error: string;
    message: string;
    code?: string;
    details?: Record<string, unknown>;
    timestamp?: string;
}

/**
 * Loading state for async operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Request status
 */
export type RequestStatus = 'pending' | 'fulfilled' | 'rejected';

// ============================================================================
// Form & Validation Types
// ============================================================================

/**
 * Form field state
 */
export interface FormField<T = string> {
    value: T;
    error: string | null;
    touched: boolean;
    dirty: boolean;
}

/**
 * Form state
 */
export interface FormState<T extends Record<string, unknown>> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isValid: boolean;
    isSubmitting: boolean;
    isDirty: boolean;
}

/**
 * Validation rule
 */
export type ValidationRule<T = unknown> = (value: T) => string | null;

/**
 * Validator function
 */
export type Validator<T> = (values: T) => Partial<Record<keyof T, string>>;

// ============================================================================
// Event Handler Types
// ============================================================================

/**
 * Generic event handler
 */
export type EventHandler<T = Event> = (event: T) => void;

/**
 * Async event handler
 */
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

/**
 * Change event handler for inputs
 */
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;

/**
 * Click event handler
 */
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;

/**
 * Submit event handler
 */
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Base component props
 */
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
    id?: string;
    'data-testid'?: string;
}

/**
 * Props with children
 */
export interface WithChildren {
    children: React.ReactNode;
}

/**
 * Props with optional children
 */
export interface WithOptionalChildren {
    children?: React.ReactNode;
}

/**
 * Props with className
 */
export interface WithClassName {
    className?: string;
}

/**
 * Props with style
 */
export interface WithStyle {
    style?: React.CSSProperties;
}

/**
 * Clickable component props
 */
export interface ClickableProps {
    onClick?: ClickHandler;
    disabled?: boolean;
}

/**
 * Modal component props
 */
export interface ModalProps extends BaseComponentProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// ============================================================================
// Data Structure Types
// ============================================================================

/**
 * Key-value pair
 */
export interface KeyValuePair<K = string, V = unknown> {
    key: K;
    value: V;
}

/**
 * Option for select/dropdown
 */
export interface SelectOption<T = string> {
    value: T;
    label: string;
    disabled?: boolean;
    icon?: React.ReactNode;
}

/**
 * Table column definition
 */
export interface TableColumn<T = unknown> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    render?: (value: unknown, item: T, index: number) => React.ReactNode;
}

/**
 * Sort configuration
 */
export interface SortConfig<T = unknown> {
    key: keyof T;
    direction: 'asc' | 'desc';
}

/**
 * Filter configuration
 */
export interface FilterConfig {
    [key: string]: string | number | boolean | null | undefined;
}

// ============================================================================
// Date & Time Types
// ============================================================================

/**
 * ISO date string
 */
export type ISODateString = string;

/**
 * Timestamp in milliseconds
 */
export type Timestamp = number;

/**
 * Date range
 */
export interface DateRange {
    start: Date | ISODateString;
    end: Date | ISODateString;
}

// ============================================================================
// ID Types for Type Safety
// ============================================================================

/**
 * Branded type for type-safe IDs
 */
export type Brand<K, T> = K & { __brand: T };

/**
 * User ID
 */
export type UserId = Brand<string, 'UserId'>;

/**
 * Policy ID
 */
export type PolicyId = Brand<string, 'PolicyId'>;

/**
 * Assignment ID
 */
export type AssignmentId = Brand<string, 'AssignmentId'>;

/**
 * Surveyor ID
 */
export type SurveyorId = Brand<string, 'SurveyorId'>;

/**
 * Report ID
 */
export type ReportId = Brand<string, 'ReportId'>;

/**
 * Document ID
 */
export type DocumentId = Brand<string, 'DocumentId'>;

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if value is defined (not null or undefined)
 */
export const isDefined = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined;
};

/**
 * Check if value is a string
 */
export const isString = (value: unknown): value is string => {
    return typeof value === 'string';
};

/**
 * Check if value is a number
 */
export const isNumber = (value: unknown): value is number => {
    return typeof value === 'number' && !isNaN(value);
};

/**
 * Check if value is an array
 */
export const isArray = <T>(value: unknown): value is T[] => {
    return Array.isArray(value);
};

/**
 * Check if value is an object
 */
export const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

/**
 * Check if value is a function
 */
export const isFunction = (value: unknown): value is Function => {
    return typeof value === 'function';
};

/**
 * Check if value is a promise
 */
export const isPromise = <T>(value: unknown): value is Promise<T> => {
    return value instanceof Promise || (isObject(value) && isFunction((value as { then?: unknown }).then));
};

// ============================================================================
// Conditional Types
// ============================================================================

/**
 * If T is never, return F, otherwise return T
 */
export type IfNever<T, F> = [T] extends [never] ? F : T;

/**
 * If T is any, return Y, otherwise return N
 */
export type IfAny<T, Y, N> = 0 extends (1 & T) ? Y : N;

/**
 * If T is unknown, return Y, otherwise return N
 */
export type IfUnknown<T, Y, N> = unknown extends T ? Y : N;

// ============================================================================
// Tuple Types
// ============================================================================

/**
 * First element of tuple
 */
export type First<T extends unknown[]> = T extends [infer F, ...unknown[]] ? F : never;

/**
 * Last element of tuple
 */
export type Last<T extends unknown[]> = T extends [...unknown[], infer L] ? L : never;

/**
 * Tail of tuple (all except first)
 */
export type Tail<T extends unknown[]> = T extends [unknown, ...infer R] ? R : never;

// ============================================================================
// String Manipulation Types
// ============================================================================

/**
 * Capitalize first letter
 */
export type Capitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Uppercase<F>}${R}` : S;

/**
 * Uncapitalize first letter
 */
export type Uncapitalize<S extends string> = S extends `${infer F}${infer R}` ? `${Lowercase<F>}${R}` : S;

/**
 * Convert to kebab-case
 */
export type KebabCase<S extends string> = S extends `${infer T}${infer U}`
    ? `${T extends Capitalize<T> ? '-' : ''}${Lowercase<T>}${KebabCase<U>}`
    : S;

// ============================================================================
// Exports
// ============================================================================

export type {
    // Re-export commonly used React types
    ReactNode,
    ReactElement,
    FC,
    ComponentType,
    PropsWithChildren,
} from 'react';
