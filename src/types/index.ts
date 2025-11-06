/**
 * Central type definitions export
 */

// Re-export all types from individual files
export * from './api.types';
export * from './component.types';
export * from './error.types';
export * from './utility.types';
export * from './hooks.types';

// Re-export constants with types
export * from '../constants';

// Common type aliases for convenience
export type { TokenType } from '../utils/auth';
export type { AuthType } from '../utils/debug-auth';

// Global type declarations
declare global {
    interface Window {
        // Add any global window properties here
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: unknown;
    }
}

// Module augmentations
declare module '*.svg' {
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
}

declare module '*.png' {
    const content: string;
    export default content;
}

declare module '*.jpg' {
    const content: string;
    export default content;
}

declare module '*.jpeg' {
    const content: string;
    export default content;
}

declare module '*.gif' {
    const content: string;
    export default content;
}

declare module '*.webp' {
    const content: string;
    export default content;
}

declare module '*.ico' {
    const content: string;
    export default content;
}

declare module '*.bmp' {
    const content: string;
    export default content;
}

declare module '*.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.scss' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.sass' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.css' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.scss' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

declare module '*.module.sass' {
    const classes: { readonly [key: string]: string };
    export default classes;
}

// Environment variables type declaration
declare namespace NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test';
        readonly NEXT_PUBLIC_API_BASE_URL?: string;
        readonly NEXT_PUBLIC_API_KEY?: string;
        readonly NEXT_PUBLIC_APP_NAME?: string;
        readonly NEXT_PUBLIC_APP_VERSION?: string;
        readonly NEXT_PUBLIC_ENVIRONMENT?: 'development' | 'staging' | 'production';
    }
}

// Utility type helpers
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// React component type helpers
export type ComponentProps<T extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<unknown>> =
    T extends React.JSXElementConstructor<infer P>
    ? P
    : T extends keyof JSX.IntrinsicElements
    ? JSX.IntrinsicElements[T]
    : never;

export type ComponentRef<T extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<unknown>> =
    T extends keyof JSX.IntrinsicElements
    ? React.ComponentRef<T>
    : T extends React.JSXElementConstructor<unknown>
    ? React.ComponentRef<T>
    : never;

// Event handler type helpers
export type EventHandler<T = Event> = (event: T) => void;
export type ChangeHandler<T = unknown> = (value: T) => void;
export type SubmitHandler<T = Record<string, unknown>> = (data: T) => void | Promise<void>;

// API response type helpers
export type ApiSuccess<T> = {
    success: true;
    data: T;
    message?: string;
};

export type ApiError = {
    success: false;
    error: string;
    message: string;
    code?: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// Form type helpers
export type FormValues<T> = {
    [K in keyof T]: T[K];
};

export type FormErrors<T> = {
    [K in keyof T]?: string;
};

export type FormTouched<T> = {
    [K in keyof T]?: boolean;
};

// State management type helpers
export type Action<T = string, P = unknown> = {
    type: T;
    payload?: P;
};

export type Reducer<S, A> = (state: S, action: A) => S;

export type Dispatch<A> = (action: A) => void;

// Async operation type helpers
export type AsyncState<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
};

export type AsyncAction<T> =
    | { type: 'LOADING' }
    | { type: 'SUCCESS'; payload: T }
    | { type: 'ERROR'; payload: string }
    | { type: 'RESET' };

// Pagination type helpers
export type PaginationState = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type SortState<T> = {
    field: keyof T;
    direction: 'asc' | 'desc';
};

export type FilterState<T> = {
    [K in keyof T]?: T[K] | T[K][];
};

// Theme type helpers
export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink' | 'gray';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Layout type helpers
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Position = 'top' | 'right' | 'bottom' | 'left';
export type Alignment = 'start' | 'center' | 'end';

// Validation type helpers
export type ValidationRule<T> = (value: T) => string | undefined;
export type ValidationSchema<T> = {
    [K in keyof T]?: ValidationRule<T[K]>[];
};

// Route type helpers
export type RouteParams = Record<string, string | string[]>;
export type SearchParams = Record<string, string | string[] | undefined>;

// File type helpers
export type FileWithPreview = File & {
    preview?: string;
};

export type UploadProgress = {
    loaded: number;
    total: number;
    percentage: number;
};

// Date type helpers
export type DateRange = {
    start: Date;
    end: Date;
};

export type TimeRange = {
    start: string;
    end: string;
};

// Generic utility types
export type KeyValuePair<K = string, V = unknown> = {
    key: K;
    value: V;
};

export type SelectOption<T = string> = {
    label: string;
    value: T;
    disabled?: boolean;
};

export type TreeNode<T = unknown> = {
    id: string;
    label: string;
    data?: T;
    children?: TreeNode<T>[];
    parent?: TreeNode<T>;
};

// Export type guards
export const isApiSuccess = <T>(response: ApiResponse<T>): response is ApiSuccess<T> => {
    return response.success === true;
};

export const isApiError = <T>(response: ApiResponse<T>): response is ApiError => {
    return response.success === false;
};

export const isDefined = <T>(value: T | undefined): value is T => {
    return value !== undefined;
};

export const isNotNull = <T>(value: T | null): value is T => {
    return value !== null;
};

export const isNotEmpty = <T>(value: T[] | string): value is NonNullable<T[] | string> => {
    return value.length > 0;
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const isArray = <T>(value: unknown): value is T[] => {
    return Array.isArray(value);
};

export const isString = (value: unknown): value is string => {
    return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
    return typeof value === 'number' && !isNaN(value);
};

export const isBoolean = (value: unknown): value is boolean => {
    return typeof value === 'boolean';
};

export const isFunction = (value: unknown): value is Function => {
    return typeof value === 'function';
};