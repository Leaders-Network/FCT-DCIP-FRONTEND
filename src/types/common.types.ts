/**
 * Common type definitions used across the application
 */

import { ReactNode } from 'react';

// Base component props
export interface BaseProps {
    className?: string;
    children?: ReactNode;
    id?: string;
    'data-testid'?: string;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Message types for notifications
export interface Message {
    type: 'success' | 'error' | 'warning' | 'info';
    text: string;
}

// Form field types
export interface FormField<T = string> {
    value: T;
    error?: string;
    touched?: boolean;
    dirty?: boolean;
}

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Pagination info
export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

// Search result item
export interface SearchResultItem {
    _id: string;
    type: 'assignment' | 'surveyor' | 'policy';
    title?: string;
    name?: string;
    address?: string;
    email?: string;
    status?: string;
}

// Modal props
export interface ModalProps extends BaseProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Button variants
export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

// Status types
export type Status = 'active' | 'inactive' | 'pending' | 'suspended' | 'completed' | 'cancelled';

// Priority levels
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// File upload types
export interface FileUploadResult {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
    publicId?: string;
}

// Date range
export interface DateRange {
    start: Date | string;
    end: Date | string;
}

// Filter options
export interface FilterOption {
    value: string;
    label: string;
    count?: number;
}

// Sort configuration
export interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}

// Table column definition
export interface TableColumn<T = unknown> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
    render?: (value: unknown, item: T, index: number) => ReactNode;
}

// Generic form data
export type FormData = Record<string, unknown>;

// Event handlers
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;

// Async function type
export type AsyncFunction<T = void> = (...args: unknown[]) => Promise<T>;

// Component with children
export interface WithChildren {
    children: ReactNode;
}

// Component with optional children
export interface WithOptionalChildren {
    children?: ReactNode;
}

// Branded types for type safety
export type Brand<K, T> = K & { __brand: T };

// ID types
export type ID = Brand<string, 'ID'>;
export type UserID = Brand<string, 'UserID'>;
export type PolicyID = Brand<string, 'PolicyID'>;
export type AssignmentID = Brand<string, 'AssignmentID'>;

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Type guards
export function isDefined<T>(value: T | null | undefined): value is T {
    return value !== null && value !== undefined;
}

export function isString(value: unknown): value is string {
    return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
    return typeof value === 'number' && !isNaN(value);
}

export function isArray<T>(value: unknown): value is T[] {
    return Array.isArray(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}