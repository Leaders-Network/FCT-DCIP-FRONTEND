/**
 * Central export point for all type definitions
 * Import types from here for consistency
 */

// Re-export all API types
export * from './api.types';

// Re-export all utility types
export * from './utility.types';

// Re-export component types if they exist
export * from './component.types';

// Common type aliases for convenience
export type {
    // Utility types
    Optional,
    RequiredFields,
    DeepPartial,
    DeepRequired,
    DeepReadonly,
    Nullable,
    NonNullableFields,
    Awaited,
    AsyncFunction,
    ArrayElement,

    // API types
    ApiResponse,
    PaginatedResponse,
    ApiError,
    LoadingState,
    RequestStatus,

    // Form types
    FormField,
    FormState,
    ValidationRule,
    Validator,

    // Event handler types
    EventHandler,
    AsyncEventHandler,
    ChangeHandler,
    ClickHandler,
    SubmitHandler,

    // Component props
    BaseComponentProps,
    WithChildren,
    WithOptionalChildren,
    WithClassName,
    WithStyle,
    ClickableProps,
    ModalProps,

    // Data structures
    KeyValuePair,
    SelectOption,
    TableColumn,
    SortConfig,
    FilterConfig,

    // Date types
    ISODateString,
    Timestamp,
    DateRange,

    // ID types
    Brand,
    UserId,
    PolicyId,
    AssignmentId,
    SurveyorId,
    ReportId,
    DocumentId,
} from './utility.types';

// Re-export type guards
export {
    isDefined,
    isString,
    isNumber,
    isArray,
    isObject,
    isFunction,
    isPromise,
} from './utility.types';
