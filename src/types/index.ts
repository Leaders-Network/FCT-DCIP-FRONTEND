/**
 * Central type exports for the Builders-Liability-AMMC Frontend application
 * This file re-exports all types from various type definition files
 * to provide a single import point for type definitions
 */

// Export all API types
export * from './api.types';

// Export all component types
export * from './component.types';

// Export all survey types
export * from './survey.types';

// Export utility types (excluding conflicting types)
export {
    // Generic utility types
    type Optional,
    type RequiredFields,
    type DeepPartial,
    type DeepRequired,
    type DeepReadonly,
    type KeysOfType,
    type ExcludeKeysOfType,
    type Nullable,
    type NonNullableFields,
    type Awaited,
    type AsyncFunction,
    type ArrayElement,
    // API types
    type PaginationData,
    type ApiSuccessResponse,
    type ApiErrorResponse,
    type PaginatedResponse,
    type LoadingState,
    type RequestStatus,
    type RecommendationAction,
    type ServerError,
    type AppError,
    // Form types
    type FormField,
    type FormState,
    type ValidationRule,
    type Validator,
    // Event handler types
    type EventHandler,
    type AsyncEventHandler,
    type ChangeHandler,
    type ClickHandler,
    type SubmitHandler,
    // Component props types
    type BaseComponentProps,
    type WithChildren,
    type WithOptionalChildren,
    type WithClassName,
    type WithStyle,
    type ClickableProps,
    type ModalProps,
    // Data structure types
    type KeyValuePair,
    type SelectOption,
    type TableColumn,
    type SortConfig,
    type FilterConfig,
    // Date types
    type ISODateString,
    type Timestamp,
    type DateRange,
    // ID types
    type Brand,
    type UserId,
    type PolicyId,
    type AssignmentId,
    type SurveyorId,
    type ReportId,
    type DocumentId,
    // Type guards
    isDefined,
    isString,
    isNumber,
    isArray,
    isObject,
    isFunction,
    isPromise,
    // Conditional types
    type IfNever,
    type IfAny,
    type IfUnknown,
    // Tuple types
    type First,
    type Last,
    type Tail,
    // String types
    type Capitalize,
    type Uncapitalize,
    type KebabCase,
} from './utility.types';

// Export error types (excluding conflicting types already in utility.types)
export {
    type BaseError,
    type AuthError,
    type FileUploadError,
    type FormError,
    type ErrorHandler,
    type ErrorRecovery,
    type ErrorBoundaryState,
    type ErrorContext,
    type ErrorNotification,
    type ErrorLogEntry,
    type ErrorResponse,
    type SuccessResponse,
    createApiError,
    createValidationError,
    createNetworkError,
    createAuthError,
    isApiError,
    isValidationError,
    isNetworkError,
    isAuthError,
} from './error.types';

// Export all claims types
export * from './claims';

// Export all hooks types
export * from './hooks.types';
