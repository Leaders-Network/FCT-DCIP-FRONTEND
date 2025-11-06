import { apiRequest } from './api';

// Processing Monitor Types
export interface ProcessingOverview {
    timeframe: string;
    organization: string;
    overview: {
        totalDualAssignments: number;
        totalMergedReports: number;
        totalConflictFlags: number;
        totalUserInquiries: number;
        averageProcessingTime?: number;
    };
    assignmentStatus?: {
        unassigned: number;
        partially_assigned: number;
        fully_assigned: number;
    };
    completionStatus?: {
        0: number;
        50: number;
        100: number;
    };
    releaseStatus?: {
        pending: number;
        withheld: number;
        released: number;
    };
    activeConflictsBySeverity: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    generatedAt?: string;
}

export interface ActiveProcessing {
    activeAssignments: Array<{
        _id: string;
        policyId: string;
        assignmentStatus: string;
        completionStatus: number;
        ammcSurveyorContact?: {
            name: string;
            email: string;
            phone: string;
        };
        niaSurveyorContact?: {
            name: string;
            email: string;
            phone: string;
        };
    }>;
    pendingReports: Array<{
        _id: string;
        policyId: string;
        releaseStatus: string;
        createdAt: string;
    }>;
    recentSubmissions?: Array<{
        _id: string;
        policyId: string;
        organization: string;
        createdAt: string;
    }>;
    lastUpdated?: string;
}

export interface PerformanceMetrics {
    timeframe?: string;
    processingPerformance: {
        avgProcessingTime: number;
        minProcessingTime?: number;
        maxProcessingTime?: number;
        totalReports: number;
    };
    successRates: {
        pending?: number;
        withheld?: number;
        released: number;
    } | number;
    conflictDetectionRates?: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    assignmentCompletion?: {
        avgCompletionTime: number;
        minCompletionTime: number;
        maxCompletionTime: number;
    };
    dailyVolume?: Array<{
        _id: string;
        count: number;
    }>;
    generatedAt?: string;
}

export interface SystemHealth {
    systemStatus: 'healthy' | 'warning' | 'critical';
    alerts?: string[];
    metrics?: {
        recentActivity: number;
        stuckProcessing: number;
    };
    lastChecked?: string;
}

export interface RecentActivity {
    activities: Array<{
        type: string;
        details: string;
        propertyAddress: string;
        timestamp: string;
    }>;
    lastUpdated?: string;
}

// Processing Monitor Service
export const processingMonitorService = {
    // Get processing overview
    getOverview: async (organization: string = 'NIA', timeframe: string = '24h') => {
        return await apiRequest<ProcessingOverview>(
            `/processing-monitor/overview?organization=${organization}&timeframe=${timeframe}`,
            { method: 'GET' }
        );
    },

    // Get active processing jobs
    getActiveProcessing: async (organization: string = 'NIA') => {
        return await apiRequest<ActiveProcessing>(
            `/processing-monitor/active?organization=${organization}`,
            { method: 'GET' }
        );
    },

    // Get performance metrics
    getPerformanceMetrics: async (timeframe: string = '24h', organization: string = 'NIA') => {
        return await apiRequest<PerformanceMetrics>(
            `/processing-monitor/performance?timeframe=${timeframe}&organization=${organization}`,
            { method: 'GET' }
        );
    },

    // Get system health
    getSystemHealth: async () => {
        return await apiRequest<SystemHealth>(
            '/processing-monitor/health',
            { method: 'GET' }
        );
    },

    // Get recent activity
    getRecentActivity: async (limit: number = 50, organization: string = 'NIA') => {
        return await apiRequest<RecentActivity>(
            `/processing-monitor/activity?limit=${limit}&organization=${organization}`,
            { method: 'GET' }
        );
    },

    // Trigger manual processing
    triggerProcessing: async (policyId?: string) => {
        return await apiRequest(
            '/processing-monitor/trigger',
            {
                method: 'POST',
                body: JSON.stringify({ policyId })
            }
        );
    },

    // Get processing status
    getProcessingStatus: async (processId: string) => {
        return await apiRequest(
            `/processing-monitor/status/${processId}`,
            { method: 'GET' }
        );
    }
};