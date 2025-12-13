/**
 * Central export file for all type definitions
 * This file re-exports all types from various type files for easy importing
 * Uses explicit exports to avoid naming conflicts
 */

import type {
    ReactNode,
    ReactElement,
    FC,
    ComponentType,
    PropsWithChildren,
    MouseEvent as ReactMouseEvent,
    ChangeEvent as ReactChangeEvent,
    FormEvent as ReactFormEvent,
    KeyboardEvent as ReactKeyboardEvent,
    FocusEvent as ReactFocusEvent,
} from 'react';

// Re-export commonly used React types
export type {
    ReactNode,
    ReactElement,
    FC,
    ComponentType,
    PropsWithChildren,
};

// Re-export React event types
export type MouseEvent<T = HTMLElement> = ReactMouseEvent<T>;
export type ChangeEvent<T = HTMLInputElement> = ReactChangeEvent<T>;
export type FormEvent<T = HTMLFormElement> = ReactFormEvent<T>;
export type KeyboardEvent<T = HTMLElement> = ReactKeyboardEvent<T>;
export type FocusEvent<T = HTMLElement> = ReactFocusEvent<T>;

// Common type aliases for convenience
export type { FC as FunctionComponent } from 'react';

// Survey Types - no conflicts
export * from './survey.types';

// Component Types - no conflicts
export * from './component.types';

// Notification Types - no conflicts
export * from './notification.types';

// API Types - export everything except conflicting types
export type {
    User,
    Employee,
    RoleType,
    UserRoles,
    Role,
    EmployeeRegistrationData,
    UserLoginResponse,
    EmployeeLoginResponse,
    AvailableRolesResponse,
    GetAllEmployeesResponse,
    PolicyRequest,
    CreatePolicyRequestData,
    Surveyor,
    SurveySubmission,
    ContactLogEntry,
    PolicyAssignment,
    PolicyReview,
    Assignment,
    DocumentFile,
    SurveyPhoto,
    SurveyDetails,
    QualityCheck,
    RevisionHistoryEntry,
    SurveySubmissionResult,
    EnhancedSurveySubmission,
    DualAssignment,
    SurveyorContact,
    ContactData,
    ConflictInquiryData,
    SurveyorContactInfo,
    AdminContactInfo,
    NIAUser,
    NIASurveyor,
    NIASurveyorForManagement,
    NIASurveyorManagementProps,
    DashboardData,
    QuickStats,
    AdminAlert,
    GetPolicyRequestsResponse,
    GetSurveyorsResponse,
    GetAssignedPoliciesResponse,
    DualAssignmentFilters,
    SurveyorFilters,
    AssignmentFilters,
    UserReport,
    ReportSectionData,
    ConflictDetails,
    MergingMetadata,
    ReportDetails,
    ReportStatus,
    ReportDetailsExtended,
    ConflictInquiry,
    InquiryResponse,
    DownloadResponse,
    ReportPhoto,
    MergedReport,
    RecentReport,
    ReportSummary,
    DualAssignmentData,
    AdminContact,
    BrokerAdmin,
    BrokerAdminLoginResponse,
    BrokerAdminVerifyResponse,
    BrokerClaimStatusHistory,
    BrokerPolicyRequest,
    BrokerDashboardData,
    BrokerClaimFilters,
    BrokerClaimsResponse,
    BrokerClaimDetailResponse,
    BrokerStatusUpdateRequest,
    BrokerStatusUpdateResponse,
    UserReportsResponse,
    ReportSummaryResponse,
    ReportDetailsResponse,
    ReportStatusResponse,
    DownloadReportResponse,
    SurveyData,
    IndividualReportDownloadResponse,
    SurveySubmissionData,
    // Export ApiResponse from api.types (preferred over utility.types version)
    ApiResponse,
    RecommendationAction,
    PaginationData,
} from './api.types';

// Utility Types - export everything except types that conflict with api.types or common.types
// We'll use the versions from api.types for ApiResponse, and common.types for common utilities
export type {
    Optional,
    RequiredFields,
    DeepPartial,
    DeepRequired,
    DeepReadonly,
    KeysOfType,
    ExcludeKeysOfType,
    Nullable,
    NonNullableFields,
    Awaited,
    ArrayElement,
    PaginatedResponse,
    ApiError,
    LoadingState,
    RequestStatus,
    ValidationError,
    NetworkError,
    ServerError,
    AppError,
    FormField,
    FormState,
    ValidationRule,
    Validator,
    EventHandler,
    AsyncEventHandler,
    BaseComponentProps,
    WithChildren,
    WithOptionalChildren,
    WithClassName,
    WithStyle,
    ClickableProps,
    ModalProps,
    KeyValuePair,
    SelectOption,
    TableColumn,
    SortConfig,
    FilterConfig,
    ISODateString,
    Timestamp,
    DateRange,
    Brand,
    UserId,
    PolicyId,
    AssignmentId,
    SurveyorId,
    ReportId,
    DocumentId,
    IfNever,
    IfAny,
    IfUnknown,
    First,
    Last,
    Tail,
    Capitalize,
    Uncapitalize,
    KebabCase,
} from './utility.types';

// Export utility type handlers (avoiding conflicts by using explicit names)
export type {
    ChangeHandler as UtilityChangeHandler,
    ClickHandler as UtilityClickHandler,
    SubmitHandler as UtilitySubmitHandler,
} from './utility.types';

// Common Types - export everything except types that conflict
export type {
    BaseProps,
    Message,
    PaginationInfo,
    SearchResultItem,
    ButtonVariant,
    ButtonSize,
    Status,
    Priority,
    FileUploadResult,
    FilterOption,
    FormData,
    AsyncFunction as CommonAsyncFunction,
} from './common.types';

// Error Types - export everything including utility functions
export type {
    BaseError,
    ApiErrorResponse,
    HttpError,
    ValidationError as ErrorValidationError,
    FormError,
    ErrorWithResponse,
    NetworkError as ErrorNetworkError,
    AuthError,
    FileUploadError,
    ErrorResult,
    SuccessResult,
    Result,
    ErrorSeverity,
    ErrorCategory,
    StructuredError,
    ErrorHandler,
    AsyncErrorHandler,
    ErrorBoundaryState,
} from './error.types';

// Export error utility functions
export {
    isHttpError,
    isValidationError,
    isNetworkError,
    isAuthError,
    createError,
    extractErrorMessage,
} from './error.types';

// Local type definitions to avoid conflicts
// These are commonly used and should be available from index
export interface LocalErrorWithResponse {
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

export interface LocalFormState<T = Record<string, unknown>> {
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    isSubmitting: boolean;
    isValid: boolean;
}

export interface LocalSuccessResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

export interface LocalErrorResponse {
    success: false;
    error: string;
    message: string;
    details?: Record<string, unknown>;
}

export type LocalAPIResponse<T = unknown> = LocalSuccessResponse<T> | LocalErrorResponse;

export interface LocalBaseComponentProps {
    className?: string;
    children?: ReactNode;
    id?: string;
    'data-testid'?: string;
}

// Event handler types (using React types)
export type LocalClickHandler<T = HTMLElement> = (event: ReactMouseEvent<T>) => void;
export type LocalChangeHandler<T = HTMLInputElement> = (event: ReactChangeEvent<T>) => void;
export type LocalSubmitHandler<T = HTMLFormElement> = (event: ReactFormEvent<T>) => void;

// Async function types
export type AsyncVoidFunction = () => Promise<void>;
export type AsyncFunction<T> = (...args: unknown[]) => Promise<T>;

// Status and state types
export type LocalLoadingState = 'idle' | 'loading' | 'success' | 'error';
export type LocalRequestStatus = 'pending' | 'fulfilled' | 'rejected';

// Utility types for better type safety
export type NonEmptyArray<T> = [T, ...T[]];
export type AtLeastOne<T> = [T, ...T[]];

// Brand types for ID safety
export type LocalBrand<K, T> = K & { __brand: T };
export type LocalID = LocalBrand<string, 'ID'>;

// Type guards
export const isString = (value: unknown): value is string => typeof value === 'string';
export const isNumber = (value: unknown): value is number => typeof value === 'number' && !isNaN(value);
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
export const isArray = <T>(value: unknown): value is T[] => Array.isArray(value);
export const isObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);
export const isDefined = <T>(value: T | null | undefined): value is T =>
    value !== null && value !== undefined;
