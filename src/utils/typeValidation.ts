/**
 * Type validation utilities for runtime type checking
 */

import {
    PolicyRequest,
    Assignment,
    Surveyor,
    NIASurveyor,
    DualAssignment,
    UserReport,
    ReportDetails,
    ApiResponse
} from '@/types/api.types';

/**
 * Type guard for PolicyRequest
 */
export const isPolicyRequest = (obj: unknown): obj is PolicyRequest => {
    if (!obj || typeof obj !== 'object') return false;

    const policy = obj as Record<string, unknown>;

    return (
        typeof policy._id === 'string' &&
        typeof policy.userId === 'string' &&
        typeof policy.propertyDetails === 'object' &&
        typeof policy.contactDetails === 'object' &&
        typeof policy.requestDetails === 'object' &&
        typeof policy.status === 'string'
    );
};

/**
 * Type guard for Assignment
 */
export const isAssignment = (obj: unknown): obj is Assignment => {
    if (!obj || typeof obj !== 'object') return false;

    const assignment = obj as Record<string, unknown>;

    return (
        typeof assignment._id === 'string' &&
        (typeof assignment.ammcId === 'string' || typeof assignment.ammcId === 'object') &&
        typeof assignment.surveyorId === 'string' &&
        typeof assignment.assignedBy === 'string' &&
        typeof assignment.status === 'string' &&
        typeof assignment.priority === 'string'
    );
};

/**
 * Type guard for Surveyor
 */
export const isSurveyor = (obj: unknown): obj is Surveyor => {
    if (!obj || typeof obj !== 'object') return false;

    const surveyor = obj as Record<string, unknown>;

    return (
        typeof surveyor._id === 'string' &&
        typeof surveyor.firstname === 'string' &&
        typeof surveyor.lastname === 'string' &&
        typeof surveyor.email === 'string'
    );
};

/**
 * Type guard for NIASurveyor
 */
export const isNIASurveyor = (obj: unknown): obj is NIASurveyor => {
    if (!obj || typeof obj !== 'object') return false;

    const surveyor = obj as Record<string, unknown>;

    return (
        typeof surveyor._id === 'string' &&
        typeof surveyor.status === 'string' &&
        Array.isArray(surveyor.specialization) &&
        typeof surveyor.currentAssignments === 'number' &&
        typeof surveyor.completedAssignments === 'number' &&
        typeof surveyor.rating === 'number'
    );
};

/**
 * Type guard for DualAssignment
 */
export const isDualAssignment = (obj: unknown): obj is DualAssignment => {
    if (!obj || typeof obj !== 'object') return false;

    const assignment = obj as Record<string, unknown>;

    return (
        typeof assignment._id === 'string' &&
        typeof assignment.policyId === 'object' &&
        typeof assignment.assignmentStatus === 'string' &&
        typeof assignment.completionStatus === 'number' &&
        typeof assignment.priority === 'string'
    );
};

/**
 * Type guard for UserReport
 */
export const isUserReport = (obj: unknown): obj is UserReport => {
    if (!obj || typeof obj !== 'object') return false;

    const report = obj as Record<string, unknown>;

    return (
        typeof report.reportId === 'string' &&
        typeof report.policyId === 'string' &&
        typeof report.propertyAddress === 'string' &&
        typeof report.propertyType === 'string' &&
        typeof report.status === 'string' &&
        typeof report.downloadCount === 'number' &&
        typeof report.canDownload === 'boolean'
    );
};

/**
 * Type guard for ReportDetails
 */
export const isReportDetails = (obj: unknown): obj is ReportDetails => {
    if (!obj || typeof obj !== 'object') return false;

    const report = obj as Record<string, unknown>;

    return (
        typeof report.reportId === 'string' &&
        typeof report.policyId === 'string' &&
        typeof report.propertyDetails === 'object' &&
        typeof report.status === 'string' &&
        typeof report.conflictDetected === 'boolean' &&
        typeof report.conflictResolved === 'boolean'
    );
};

/**
 * Type guard for ApiResponse
 */
export const isApiResponse = <T>(obj: unknown): obj is ApiResponse<T> => {
    if (!obj || typeof obj !== 'object') return false;

    const response = obj as Record<string, unknown>;

    return typeof response.success === 'boolean';
};

/**
 * Validate array of items with type guard
 */
export const validateArray = <T>(
    items: unknown[],
    typeGuard: (item: unknown) => item is T
): T[] => {
    return items.filter(typeGuard);
};

/**
 * Safe property access with type checking
 */
export const safeGet = <T, K extends keyof T>(
    obj: T | null | undefined,
    key: K
): T[K] | undefined => {
    if (!obj || typeof obj !== 'object') return undefined;
    return obj[key];
};

/**
 * Safe nested property access
 */
export const safeGetNested = <T>(
    obj: unknown,
    path: string[]
): T | undefined => {
    let current = obj;

    for (const key of path) {
        if (!current || typeof current !== 'object') {
            return undefined;
        }
        current = (current as Record<string, unknown>)[key];
    }

    return current as T;
};

/**
 * Validate required fields in object
 */
export const validateRequiredFields = <T extends Record<string, unknown>>(
    obj: T,
    requiredFields: (keyof T)[]
): boolean => {
    return requiredFields.every(field => {
        const value = obj[field];
        return value !== null && value !== undefined && value !== '';
    });
};

/**
 * Clean object by removing null/undefined values
 */
export const cleanObject = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
    const cleaned: Partial<T> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (value !== null && value !== undefined) {
            cleaned[key as keyof T] = value;
        }
    }

    return cleaned;
};

/**
 * Deep clone object with type safety
 */
export const deepClone = <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (obj instanceof Date) {
        return new Date(obj.getTime()) as unknown as T;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item)) as unknown as T;
    }

    const cloned = {} as T;
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }

    return cloned;
};