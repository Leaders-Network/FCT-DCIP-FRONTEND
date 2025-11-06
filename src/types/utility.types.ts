/**
 * Utility type definitions
 */

// Make all properties optional
export type Partial<T> = {
    [P in keyof T]?: T[P];
};

// Make all properties required
export type Required<T> = {
    [P in keyof T]-?: T[P];
};

// Pick specific properties from a type
export type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};

// Omit specific properties from a type
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// Make specific properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Nullable type
export type Nullable<T> = T | null;

// Optional type
export type Optional<T> = T | undefined;

// Maybe type (nullable or undefined)
export type Maybe<T> = T | null | undefined;

// Non-nullable type
export type NonNullable<T> = T extends null | undefined ? never : T;

// Deep partial type
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Deep required type
export type DeepRequired<T> = {
    [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

// Readonly deep type
export type DeepReadonly<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// Mutable type (opposite of readonly)
export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
};

// Deep mutable type
export type DeepMutable<T> = {
    -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

// Extract function parameters
export type Parameters<T extends (...args: unknown[]) => unknown> = T extends (...args: infer P) => unknown ? P : never;

// Extract function return type
export type ReturnType<T extends (...args: unknown[]) => unknown> = T extends (...args: unknown[]) => infer R ? R : unknown;

// Promise type extraction
export type Awaited<T> = T extends Promise<infer U> ? U : T;

// Array element type
export type ArrayElement<T> = T extends (infer U)[] ? U : never;

// Object values type
export type ValueOf<T> = T[keyof T];

// Object keys type
export type KeyOf<T> = keyof T;

// Conditional type
export type If<C extends boolean, T, F> = C extends true ? T : F;

// Union to intersection type
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

// Flatten type
export type Flatten<T> = T extends (infer U)[] ? U : T;

// Tuple to union type
export type TupleToUnion<T extends readonly unknown[]> = T[number];

// String literal type helpers (these are built-in TypeScript utility types)
// No need to redefine them, they're available globally

// Brand type for nominal typing
export type Brand<T, B> = T & { __brand: B };

// ID types
export type ID = Brand<string, 'ID'>;
export type UserID = Brand<string, 'UserID'>;
export type PolicyID = Brand<string, 'PolicyID'>;
export type AssignmentID = Brand<string, 'AssignmentID'>;

// Status types
export type Status = 'idle' | 'loading' | 'success' | 'error';
export type AsyncStatus = 'idle' | 'pending' | 'fulfilled' | 'rejected';

// Common form field types
export type FormFieldType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'time' | 'datetime-local';

// Validation result type
export type ValidationResult<T = unknown> = {
    isValid: boolean;
    errors: string[];
    value?: T;
};

// API response wrapper
export type ApiResponseWrapper<T> = {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
};

// Pagination info
export type PaginationInfo = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};

// Sort order
export type SortOrder = 'asc' | 'desc';

// Sort configuration
export type SortConfig<T> = {
    field: keyof T;
    order: SortOrder;
};

// Filter configuration
export type FilterConfig<T> = {
    field: keyof T;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains' | 'startsWith' | 'endsWith';
    value: unknown;
};

// Search configuration
export type SearchConfig<T> = {
    fields: (keyof T)[];
    query: string;
    caseSensitive?: boolean;
};

// Theme types
export type Theme = 'light' | 'dark' | 'auto';
export type ColorScheme = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'pink' | 'gray';

// Size types
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Spacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Position types
export type Position = 'top' | 'right' | 'bottom' | 'left';
export type Alignment = 'start' | 'center' | 'end';

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type ChangeHandler<T = unknown> = (value: T) => void;
export type SubmitHandler<T = Record<string, unknown>> = (data: T) => void | Promise<void>;

// Component ref types
export type ComponentRef<T = HTMLElement> = React.RefObject<T>;
export type ForwardedRef<T = HTMLElement> = React.ForwardedRef<T>;

// Children types
export type Children = React.ReactNode;
export type ChildrenFunction<T = unknown> = (props: T) => React.ReactNode;

// Style types
export type CSSProperties = React.CSSProperties;
export type ClassName = string | undefined;

// Generic function types
export type AnyFunction = (...args: unknown[]) => unknown;
export type VoidFunction = () => void;
export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>;

// Utility function types
export type Predicate<T> = (value: T) => boolean;
export type Mapper<T, U> = (value: T) => U;
export type Reducer<T, U> = (accumulator: U, current: T) => U;

// Date types
export type DateString = string; // ISO date string
export type Timestamp = number; // Unix timestamp

// File types
export type FileType = 'image' | 'document' | 'video' | 'audio' | 'archive' | 'other';
export type MimeType = string;

// URL types
export type URL = string;
export type RelativeURL = string;
export type AbsoluteURL = string;

// Environment types
export type Environment = 'development' | 'staging' | 'production';

// Log level types
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// Content type
export type ContentType = 'application/json' | 'application/xml' | 'text/html' | 'text/plain' | 'multipart/form-data' | 'application/x-www-form-urlencoded';

// Generic dictionary type
export type Dictionary<T = unknown> = Record<string, T>;

// Serializable types (for JSON)
export type Serializable = string | number | boolean | null | SerializableObject | SerializableArray;
export type SerializableObject = { [key: string]: Serializable };
export type SerializableArray = Serializable[];

// Deep freeze type
export type DeepFreeze<T> = {
    readonly [P in keyof T]: T[P] extends object ? DeepFreeze<T[P]> : T[P];
};

// Extract type from array
export type ExtractArrayType<T> = T extends (infer U)[] ? U : never;

// Extract type from promise
export type ExtractPromiseType<T> = T extends Promise<infer U> ? U : never;

// Conditional required fields
export type ConditionalRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Conditional optional fields
export type ConditionalOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Type-safe object keys
export const typedKeys = <T extends Record<string, unknown>>(obj: T): (keyof T)[] => {
    return Object.keys(obj) as (keyof T)[];
};

// Type-safe object entries
export const typedEntries = <T extends Record<string, unknown>>(obj: T): [keyof T, T[keyof T]][] => {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
};

// Type guard for non-null values
export const isNonNull = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined;
};

// Type guard for defined values
export const isDefined = <T>(value: T | undefined): value is T => {
    return value !== undefined;
};

// Type guard for non-empty strings
export const isNonEmptyString = (value: unknown): value is string => {
    return typeof value === 'string' && value.length > 0;
};

// Type guard for arrays
export const isArray = <T>(value: unknown): value is T[] => {
    return Array.isArray(value);
};

// Type guard for objects
export const isObject = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
};

// Type guard for functions
export const isFunction = (value: unknown): value is AnyFunction => {
    return typeof value === 'function';
};