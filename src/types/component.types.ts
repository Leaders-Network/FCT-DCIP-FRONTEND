import React from 'react';
import {
    Assignment,
    DualAssignment,
    Surveyor,
    PolicyRequest,
    EnhancedSurveySubmission,
    ContactLogEntry,
    SurveyorContactInfo,
    AdminContactInfo,
    ConflictInquiryData,
    UserReport,
    ReportDetails,
    NIASurveyor,
    NIASurveyorForManagement
} from './api.types';

// Base Component Props
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
}

// Assignment Management Component Props
export interface AssignmentManagementProps {
    assignment: DualAssignment;
    onAssignmentComplete: () => void;
    onClose: () => void;
}

// Surveyor Management Component Props
export interface SurveyorManagementProps {
    surveyors: Surveyor[];
    onSurveyorUpdate: (surveyor: Surveyor) => void;
    onSurveyorDelete: (surveyorId: string) => void;
}

// Policy Details Component Props
export interface PolicyDetailsProps {
    policy: PolicyRequest;
    onUpdate?: (policy: PolicyRequest) => void;
    readOnly?: boolean;
}

// Contact Management Component Props
export interface ContactManagementProps {
    ammcSurveyor: SurveyorContactInfo | null;
    niaSurveyor: SurveyorContactInfo | null;
    assignmentStatus: 'unassigned' | 'partially_assigned' | 'fully_assigned';
    ammcAdmin: AdminContactInfo | null;
    niaAdmin: AdminContactInfo | null;
    policyId?: string;
    mergedReportId?: string;
    hasConflicts: boolean;
    showContactActions?: boolean;
    defaultExpandedSection?: 'ammc' | 'nia' | 'both' | 'none';
    onConflictSubmit?: (conflictData: ConflictInquiryData) => Promise<void>;
}

// Report List Component Props
export interface ReportListProps {
    reports: UserReport[];
    onReportSelect: (reportId: string) => void;
    loading?: boolean;
}

// Report Details Component Props
export interface ReportDetailsProps {
    report: ReportDetails;
    onDownload?: (reportId: string) => void;
    onClose?: () => void;
}

// Assignment Detail Component Props
export interface AssignmentDetailProps {
    assignmentId: string;
    assignment?: Assignment;
    onStatusUpdate?: (status: string) => void;
}

// Survey Submission Component Props
export interface SurveySubmissionProps {
    assignment: Assignment;
    policy: PolicyRequest;
    onSubmit: (submission: SurveySubmissionData) => Promise<void>;
    onCancel: () => void;
}

// Survey Submission Data Interface
export interface SurveySubmissionData {
    surveyDetails: {
        propertyCondition: string;
        structuralAssessment: string;
        riskFactors: string;
        recommendations: string;
        estimatedValue?: number;
        photos: Array<{
            url: string;
            description: string;
            timestamp: string;
        }>;
    };
    surveyNotes: string;
    contactLog: ContactLogEntry[];
    recommendedAction: 'approve' | 'reject' | 'request_more_info';
    surveyDocument?: File;
    expenses?: {
        transportation: number;
        accommodation: number;
        meals: number;
        equipment: number;
        other: number;
        receipts: Array<{
            description: string;
            amount: number;
            receiptUrl: string;
            category: string;
        }>;
    };
}

// NIA Surveyor Management Props - moved to api.types.ts to avoid duplication

// Modal Component Props
export interface ModalComponentProps extends BaseComponentProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Form Component Props
export interface FormComponentProps extends BaseComponentProps {
    onSubmit: (data: Record<string, unknown>) => void;
    initialData?: Record<string, unknown>;
    loading?: boolean;
    disabled?: boolean;
}

// Table Component Props
export interface TableComponentProps<T = unknown> extends BaseComponentProps {
    data: T[];
    columns: Array<{
        key: keyof T | string;
        label: string;
        sortable?: boolean;
        render?: (value: unknown, item: T, index: number) => React.ReactNode;
    }>;
    loading?: boolean;
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    onRowClick?: (item: T, index: number) => void;
}

// Search Component Props
export interface SearchComponentProps extends BaseComponentProps {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    onSearch?: (value: string) => void;
    loading?: boolean;
}

// Filter Component Props
export interface FilterComponentProps extends BaseComponentProps {
    filters: Record<string, string>;
    onFilterChange: (key: string, value: string) => void;
    onReset?: () => void;
}

// Pagination Component Props
export interface PaginationComponentProps extends BaseComponentProps {
    currentPage: number;
    totalPages: number;
    totalItems?: number;
    itemsPerPage?: number;
    onPageChange: (page: number) => void;
    showInfo?: boolean;
}

// Dashboard Card Props
export interface DashboardCardProps extends BaseComponentProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ComponentType<{ className?: string }>;
    trend?: {
        value: number;
        direction: 'up' | 'down';
        label?: string;
    };
    loading?: boolean;
}

// Status Badge Props
export interface StatusBadgeProps extends BaseComponentProps {
    status: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    size?: 'sm' | 'md' | 'lg';
}

// File Upload Props
export interface FileUploadComponentProps extends BaseComponentProps {
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
    onUpload: (files: File[]) => void;
    onError?: (error: string) => void;
    loading?: boolean;
    disabled?: boolean;
}

// Dropdown Props
export interface DropdownComponentProps extends BaseComponentProps {
    options: Array<{
        value: string;
        label: string;
        disabled?: boolean;
    }>;
    value?: string;
    placeholder?: string;
    onChange: (value: string) => void;
    loading?: boolean;
    disabled?: boolean;
    searchable?: boolean;
}

// Navigation Props
export interface NavigationProps extends BaseComponentProps {
    items: Array<{
        href: string;
        label: string;
        icon?: React.ComponentType<{ className?: string }>;
        badge?: string | number;
        active?: boolean;
    }>;
    onItemClick?: (href: string) => void;
}

// Sidebar Props
export interface SidebarProps extends BaseComponentProps {
    isOpen: boolean;
    onToggle: () => void;
    navigation: NavigationProps['items'];
}

// Header Props
export interface HeaderProps extends BaseComponentProps {
    title?: string;
    user?: {
        name: string;
        email: string;
        avatar?: string;
    };
    onUserMenuClick?: () => void;
    onNotificationClick?: () => void;
    notificationCount?: number;
}

// Loading Component Props
export interface LoadingComponentProps extends BaseComponentProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    overlay?: boolean;
}

// Error Component Props
export interface ErrorComponentProps extends BaseComponentProps {
    error: string | Error;
    onRetry?: () => void;
    showDetails?: boolean;
}

// Empty State Props
export interface EmptyStateProps extends BaseComponentProps {
    title: string;
    description?: string;
    icon?: React.ComponentType<{ className?: string }>;
    action?: {
        label: string;
        onClick: () => void;
    };
}

// Confirmation Dialog Props
export interface ConfirmationDialogProps extends ModalComponentProps {
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'danger';
    onConfirm: () => void;
    loading?: boolean;
}

// Toast Notification Props
export interface ToastProps {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    onClose: (id: string) => void;
}

// Chart Component Props
export interface ChartComponentProps extends BaseComponentProps {
    data: Array<{
        label: string;
        value: number;
        color?: string;
    }>;
    type: 'bar' | 'line' | 'pie' | 'doughnut';
    title?: string;
    height?: number;
    loading?: boolean;
}
