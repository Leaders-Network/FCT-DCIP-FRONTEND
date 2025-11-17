/**
 * Central export point for all type definitions
 * Import types from here for consistency
 */

// Re-export all API types (excluding AssignmentManagementProps to avoid duplicate)
export * from './api.types';

// Re-export all utility types
export * from './utility.types';

// Re-export component types (excluding AssignmentManagementProps which is in api.types)
export type {
    SurveySubmissionData,
    ModalComponentProps,
    FormComponentProps,
    TableComponentProps,
    SearchComponentProps,
    FilterComponentProps,
    PaginationComponentProps,
    DashboardCardProps,
    StatusBadgeProps,
    FileUploadComponentProps,
    DropdownComponentProps,
    NavigationProps,
    SidebarProps,
    HeaderProps,
    LoadingComponentProps,
    ErrorComponentProps,
    EmptyStateProps,
    ConfirmationDialogProps,
    ToastProps,
    ChartComponentProps,
    ContactManagementProps,
    PolicyDetailsProps,
    ReportListProps,
    ReportDetailsProps,
    AssignmentDetailProps,
    SurveySubmissionProps,
    SurveyorManagementProps
} from './component.types';

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

// Re-export BaseComponentProps separately to avoid duplicate
export type { BaseComponentProps } from './component.types';
