/**
 * Utility types for better type safety across the application
 */

// Generic API Response wrapper
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// Pagination wrapper
export interface PaginatedResponse<T> extends ApiResponse<{
    items: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}> { }

// Form validation types
export interface ValidationError {
    field: string;
    message: string;
}

export interface FormState<T> {
    data: T;
    errors: Record<keyof T, string>;
    isValid: boolean;
    isSubmitting: boolean;
}

// Component prop types
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
}

export interface ModalProps extends BaseComponentProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
}

// Status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T> {
    key: keyof T;
    direction: SortDirection;
}

// Filter types
export interface FilterConfig {
    [key: string]: string | number | boolean | undefined;
}

// Table types
export interface TableColumn<T> {
    key: keyof T;
    label: string;
    sortable?: boolean;
    render?: (value: T[keyof T], item: T) => React.ReactNode;
}

// File upload types
export interface FileUploadConfig {
    maxSize: number; // in bytes
    allowedTypes: string[];
    multiple?: boolean;
}

export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: string;
}

// Date range types
export interface DateRange {
    startDate: Date | null;
    endDate: Date | null;
}

// Search types
export interface SearchConfig {
    query: string;
    filters: FilterConfig;
    sortBy?: string;
    sortDirection?: SortDirection;
    page: number;
    limit: number;
}

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    duration?: number;
    actions?: Array<{
        label: string;
        action: () => void;
    }>;
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Permission types
export interface Permission {
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete';
}

export interface UserPermissions {
    permissions: Permission[];
    roles: string[];
}

// Audit types
export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    resource: string;
    resourceId: string;
    changes?: Record<string, { from: unknown; to: unknown }>;
    timestamp: string;
    ipAddress?: string;
    userAgent?: string;
}

// Export utility type helpers
export type Partial<T> = {
    [P in keyof T]?: T[P];
};

export type Required<T> = {
    [P in keyof T]-?: T[P];
};

export type Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// String literal type helpers
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;

// Function type helpers
export type AsyncFunction<T extends unknown[], R> = (...args: T) => Promise<R>;
export type SyncFunction<T extends unknown[], R> = (...args: T) => R;

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type ChangeHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;
export type SubmitHandler<T = HTMLFormElement> = (event: React.FormEvent<T>) => void;

// Component ref types
export type ComponentRef<T> = React.RefObject<T> | React.MutableRefObject<T>;

// Conditional types
export type NonNullable<T> = T extends null | undefined ? never : T;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;