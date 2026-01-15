/**
 * Application constants with proper typing
 */

// API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1',
    API_KEY: process.env.NEXT_PUBLIC_API_KEY || '',
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 second
} as const;

// Authentication Constants
export const AUTH_CONSTANTS = {
    TOKEN_KEYS: {
        SUPER_ADMIN: 'superAdminToken',
        NIA_ADMIN: 'niaAdminToken',
        ADMIN: 'adminToken',
        SURVEYOR: 'surveyorToken',
        USER: 'userToken',
        LEGACY: 'token',
        AUTH: 'authToken'
    },
    USER_INFO_KEYS: {
        SURVEYOR_NAME: 'surveyorName',
        SURVEYOR_ID: 'surveyorId',
        SURVEYOR_ORG: 'surveyorOrganization',
        SURVEYOR_INFO: 'surveyorInfo',
        USER_ROLE: 'userRole',
        NIA_ADMIN_INFO: 'niaAdminInfo',
        ADMIN_INFO: 'adminInfo',
        USER_INFO: 'userInfo',
        SUPER_ADMIN_INFO: 'superAdminInfo'
    },
    TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    REFRESH_THRESHOLD: 5 * 60 * 1000 // 5 minutes before expiry
} as const;

// Status Constants
export const STATUS_CONSTANTS = {
    POLICY: {
        PENDING: 'pending',
        SUBMITTED: 'submitted',
        ASSIGNED: 'assigned',
        SURVEYED: 'surveyed',
        APPROVED: 'approved',
        REJECTED: 'rejected',
        COMPLETED: 'completed'
    },
    ASSIGNMENT: {
        ASSIGNED: 'assigned',
        ACCEPTED: 'accepted',
        IN_PROGRESS: 'in_progress',
        COMPLETED: 'completed',
        REJECTED: 'rejected',
        CANCELLED: 'cancelled'
    },
    DUAL_ASSIGNMENT: {
        UNASSIGNED: 'unassigned',
        PARTIALLY_ASSIGNED: 'partially_assigned',
        FULLY_ASSIGNED: 'fully_assigned'
    },
    REPORT: {
        PENDING: 'pending',
        WITHHELD: 'withheld',
        RELEASED: 'released'
    },
    SURVEYOR: {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        SUSPENDED: 'suspended'
    },
    AVAILABILITY: {
        AVAILABLE: 'available',
        BUSY: 'busy',
        UNAVAILABLE: 'unavailable'
    }
} as const;

// Priority Constants
export const PRIORITY_CONSTANTS = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
} as const;

// Organization Constants
export const ORGANIZATION_CONSTANTS = {
    AMMC: 'AMMC',
    NIA: 'NIA'
} as const;

// Property Type Constants
export const PROPERTY_TYPE_CONSTANTS = {
    RESIDENTIAL: 'residential',
    COMMERCIAL: 'commercial',
    INDUSTRIAL: 'industrial',
    MIXED_USE: 'mixed-use',
    LAND: 'land'
} as const;

// File Type Constants
export const FILE_TYPE_CONSTANTS = {
    IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEETS: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ALL_ALLOWED: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
} as const;

// File Size Constants (in bytes)
export const FILE_SIZE_CONSTANTS = {
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_TOTAL_SIZE: 50 * 1024 * 1024 // 50MB
} as const;

// Pagination Constants
export const PAGINATION_CONSTANTS = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
} as const;

// UI Constants
export const UI_CONSTANTS = {
    DEBOUNCE_DELAY: 300, // milliseconds
    TOAST_DURATION: 5000, // 5 seconds
    MODAL_ANIMATION_DURATION: 200, // milliseconds
    LOADING_DELAY: 100, // milliseconds before showing loading state
    BREAKPOINTS: {
        SM: 640,
        MD: 768,
        LG: 1024,
        XL: 1280,
        '2XL': 1536
    }
} as const;

// Validation Constants
export const VALIDATION_CONSTANTS = {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 50,
    MAX_EMAIL_LENGTH: 254,
    MAX_PHONE_LENGTH: 20,
    MAX_ADDRESS_LENGTH: 500,
    MAX_NOTES_LENGTH: 1000,
    MAX_DESCRIPTION_LENGTH: 2000
} as const;

// Date Format Constants
export const DATE_FORMAT_CONSTANTS = {
    DISPLAY: 'MMM dd, yyyy',
    INPUT: 'yyyy-MM-dd',
    DATETIME: 'MMM dd, yyyy HH:mm',
    TIME: 'HH:mm',
    ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK: 'Network error. Please check your connection and try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied. Insufficient permissions.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Server error. Please try again later.',
    VALIDATION: 'Please check your input and try again.',
    FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
    INVALID_FILE_TYPE: 'Invalid file type. Please select a supported file.',
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PHONE: 'Please enter a valid phone number.',
    PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION_CONSTANTS.MIN_PASSWORD_LENGTH} characters long.`,
    PASSWORDS_DONT_MATCH: 'Passwords do not match.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    SAVED: 'Changes saved successfully.',
    CREATED: 'Created successfully.',
    UPDATED: 'Updated successfully.',
    DELETED: 'Deleted successfully.',
    UPLOADED: 'File uploaded successfully.',
    SUBMITTED: 'Submitted successfully.',
    ASSIGNED: 'Assignment completed successfully.',
    APPROVED: 'Approved successfully.',
    REJECTED: 'Rejected successfully.'
} as const;

// Route Constants
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    ADMIN: {
        DASHBOARD: '/admin/dashboard',
        POLICIES: '/admin/dashboard/policies',
        SURVEYORS: '/admin/dashboard/surveyors',
        ASSIGNMENTS: '/admin/dashboard/assignments',
        REPORTS: '/admin/dashboard/reports',
        USERS: '/admin/dashboard/users',
        SETTINGS: '/admin/dashboard/settings'
    },
    NIA_ADMIN: {
        DASHBOARD: '/nia-admin/dashboard',
        ASSIGNMENTS: '/nia-admin/assignments',
        SURVEYORS: '/nia-admin/surveyors',
        PROCESSING_MONITOR: '/nia-admin/processing-monitor',
        REPORTS: '/nia-admin/reports'
    },
    SURVEYOR: {
        DASHBOARD: '/surveyor/dashboard',
        ASSIGNMENTS: '/surveyor/dashboard/assignments',
        SUBMISSIONS: '/surveyor/dashboard/submissions',
        PROFILE: '/surveyor/dashboard/profile'
    },
    USER: {
        DASHBOARD: '/dashboard',
        POLICIES: '/dashboard/insurance',
        REPORTS: '/dashboard/reports',
        CONTACTS: '/dashboard/contacts',
        PROFILE: '/dashboard/profile'
    }
} as const;

// Theme Constants
export const THEME_CONSTANTS = {
    COLORS: {
        PRIMARY: '#028835',
        SECONDARY: '#0066CC',
        SUCCESS: '#10B981',
        WARNING: '#F59E0B',
        ERROR: '#EF4444',
        INFO: '#3B82F6'
    },
    SIZES: {
        XS: 'xs',
        SM: 'sm',
        MD: 'md',
        LG: 'lg',
        XL: 'xl'
    }
} as const;

// Export type definitions for constants
export type StatusType = typeof STATUS_CONSTANTS[keyof typeof STATUS_CONSTANTS][keyof typeof STATUS_CONSTANTS[keyof typeof STATUS_CONSTANTS]];
export type PriorityType = typeof PRIORITY_CONSTANTS[keyof typeof PRIORITY_CONSTANTS];
export type OrganizationType = typeof ORGANIZATION_CONSTANTS[keyof typeof ORGANIZATION_CONSTANTS];
export type PropertyType = typeof PROPERTY_TYPE_CONSTANTS[keyof typeof PROPERTY_TYPE_CONSTANTS];
export type RouteType = typeof ROUTES[keyof typeof ROUTES] | typeof ROUTES[keyof typeof ROUTES][keyof typeof ROUTES[keyof typeof ROUTES]];
export type ThemeColorType = typeof THEME_CONSTANTS.COLORS[keyof typeof THEME_CONSTANTS.COLORS];
export type ThemeSizeType = typeof THEME_CONSTANTS.SIZES[keyof typeof THEME_CONSTANTS.SIZES];