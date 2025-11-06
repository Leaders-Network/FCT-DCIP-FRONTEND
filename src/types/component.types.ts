/**
 * Component-specific type definitions
 */

import React from 'react';
import {
    PolicyRequest,
    Assignment,
    NIASurveyor,
    DualAssignment,
    SurveyorContactInfo,
    AdminContactInfo,
    ConflictInquiryData,
    UserReport,
    ReportDetails
} from './api.types';

// Base component props
export interface BaseProps {
    className?: string;
    children?: React.ReactNode;
}

// Modal component props
export interface ModalProps extends BaseProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Form component props
export interface FormProps<T = Record<string, unknown>> extends BaseProps {
    initialData?: Partial<T>;
    onSubmit: (data: T) => void | Promise<void>;
    onCancel?: () => void;
    loading?: boolean;
    disabled?: boolean;
}

// Table component props
export interface TableProps<T> extends BaseProps {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
    sortable?: boolean;
    pagination?: PaginationConfig;
}

export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: unknown, item: T, index: number) => React.ReactNode;
}

export interface PaginationConfig {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
}

// Assignment Management Component Props
export interface AssignmentManagementProps {
    assignment: DualAssignment;
    onAssignmentComplete: () => void;
    onClose: () => void;
}

// Surveyor Management Component Props
export interface SurveyorManagementProps {
    surveyor?: NIASurveyor | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (surveyor: NIASurveyor) => Promise<void>;
    onClose: () => void;
}

// Policy Details Component Props
export interface PolicyDetailsProps {
    policyId: string;
    onBack: () => void;
    showBackButton?: boolean;
}

// Contact Management Component Props
export interface ContactManagementProps {
    ammcSurveyor?: SurveyorContactInfo | null;
    niaSurveyor?: SurveyorContactInfo | null;
    assignmentStatus: 'unassigned' | 'partially_assigned' | 'fully_assigned';
    ammcAdmin?: AdminContactInfo | null;
    niaAdmin?: AdminContactInfo | null;
    policyId?: string;
    mergedReportId?: string;
    hasConflicts: boolean;
    showContactActions?: boolean;
    showAdminContacts?: boolean;
    defaultExpandedSection?: 'ammc' | 'nia' | 'both' | 'none';
    onConflictSubmit?: (data: ConflictInquiryData) => Promise<void>;
}

// Report Component Props
export interface ReportListProps {
    reports: UserReport[];
    loading?: boolean;
    onViewReport: (reportId: string) => void;
    onDownloadReport?: (reportId: string) => void;
    pagination?: PaginationConfig;
}

export interface ReportDetailsProps {
    reportId: string;
    isOpen: boolean;
    onClose: () => void;
}

// Assignment Detail Component Props
export interface AssignmentDetailProps {
    assignmentId: string;
}

// Survey Submission Component Props
export interface SurveySubmissionProps {
    policy: PolicyRequest;
    assignment: Assignment;
    isOpen: boolean;
    onSubmit: (data: SurveySubmissionData) => Promise<void>;
    onClose: () => void;
}

export interface SurveySubmissionData {
    surveyNotes: string;
    recommendedAction: 'approve' | 'reject' | 'request_more_info';
    contactLog: ContactLogEntry[];
    surveyDetails: SurveyDetails;
    expenses?: ExpenseData;
    surveyDocument?: File;
}

export interface ContactLogEntry {
    date: string;
    method: 'phone' | 'email' | 'sms' | 'visit';
    notes: string;
    successful: boolean;
    duration?: number;
}

export interface SurveyDetails {
    propertyCondition: string;
    structuralAssessment: string;
    riskFactors: string;
    recommendations: string;
    estimatedValue?: number;
    photos: SurveyPhoto[];
}

export interface SurveyPhoto {
    url: string;
    publicId: string;
    description: string;
    timestamp: string;
}

export interface ExpenseData {
    transportation: number;
    accommodation: number;
    meals: number;
    equipment: number;
    other: number;
    receipts: ExpenseReceipt[];
    totalExpenses: number;
}

export interface ExpenseReceipt {
    description: string;
    amount: number;
    receiptUrl: string;
    category: string;
}

// Filter Component Props
export interface FilterProps<T = Record<string, unknown>> extends BaseProps {
    filters: T;
    onFiltersChange: (filters: T) => void;
    onReset?: () => void;
    loading?: boolean;
}

// Search Component Props
export interface SearchProps extends BaseProps {
    value: string;
    onChange: (value: string) => void;
    onSearch?: (value: string) => void;
    placeholder?: string;
    loading?: boolean;
    debounceMs?: number;
}

// Status Badge Component Props
export interface StatusBadgeProps extends BaseProps {
    status: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
}

// Progress Component Props
export interface ProgressProps extends BaseProps {
    value: number;
    max?: number;
    label?: string;
    showPercentage?: boolean;
    variant?: 'default' | 'success' | 'warning' | 'error';
    size?: 'sm' | 'md' | 'lg';
}

// Card Component Props
export interface CardProps extends BaseProps {
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    loading?: boolean;
    error?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

// Button Component Props
export interface ButtonProps extends BaseProps {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

// Input Component Props
export interface InputProps extends BaseProps {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    iconPosition?: 'left' | 'right';
}

// Select Component Props
export interface SelectProps<T = string> extends BaseProps {
    value: T;
    onChange: (value: T) => void;
    options: SelectOption<T>[];
    placeholder?: string;
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    loading?: boolean;
    searchable?: boolean;
    multiple?: boolean;
}

export interface SelectOption<T = string> {
    value: T;
    label: string;
    disabled?: boolean;
    group?: string;
}

// Textarea Component Props
export interface TextareaProps extends BaseProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    rows?: number;
    maxLength?: number;
    resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

// File Upload Component Props
export interface FileUploadProps extends BaseProps {
    onFileSelect: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
    disabled?: boolean;
    loading?: boolean;
    error?: string;
    preview?: boolean;
}

// Navigation Component Props
export interface NavigationProps extends BaseProps {
    items: NavigationItem[];
    activeItem?: string;
    onItemClick?: (item: NavigationItem) => void;
    collapsed?: boolean;
    orientation?: 'horizontal' | 'vertical';
}

export interface NavigationItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    badge?: string | number;
    children?: NavigationItem[];
}

// Notification Component Props
export interface NotificationProps extends BaseProps {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    onClose?: () => void;
    actions?: NotificationAction[];
}

export interface NotificationAction {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
}

// Loading Component Props
export interface LoadingProps extends BaseProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    overlay?: boolean;
}

// Empty State Component Props
export interface EmptyStateProps extends BaseProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

// Error Boundary Component Props
export interface ErrorBoundaryProps extends BaseProps {
    fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Layout Component Props
export interface LayoutProps extends BaseProps {
    header?: React.ReactNode;
    sidebar?: React.ReactNode;
    footer?: React.ReactNode;
    sidebarCollapsed?: boolean;
    onSidebarToggle?: () => void;
}

// Dashboard Component Props
export interface DashboardProps extends BaseProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    widgets?: DashboardWidget[];
}

export interface DashboardWidget {
    id: string;
    title: string;
    component: React.ComponentType<unknown>;
    props?: Record<string, unknown>;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    order?: number;
}

// Export all types
export type {
    BaseProps,
    ModalProps,
    FormProps,
    TableProps,
    TableColumn,
    PaginationConfig,
    AssignmentManagementProps,
    SurveyorManagementProps,
    PolicyDetailsProps,
    ContactManagementProps,
    ReportListProps,
    ReportDetailsProps,
    AssignmentDetailProps,
    SurveySubmissionProps,
    SurveySubmissionData,
    ContactLogEntry,
    SurveyDetails,
    SurveyPhoto,
    ExpenseData,
    ExpenseReceipt,
    FilterProps,
    SearchProps,
    StatusBadgeProps,
    ProgressProps,
    CardProps,
    ButtonProps,
    InputProps,
    SelectProps,
    SelectOption,
    TextareaProps,
    FileUploadProps,
    NavigationProps,
    NavigationItem,
    NotificationProps,
    NotificationAction,
    LoadingProps,
    EmptyStateProps,
    ErrorBoundaryProps,
    LayoutProps,
    DashboardProps,
    DashboardWidget
};