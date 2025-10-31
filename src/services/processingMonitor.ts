import { apiRequest } from '@/services/api';

export interface ProcessingOverview {
    timeframe: string;
    organization: string;
    overview: {
        totalDualAssignments: number;
        totalMergedReports: number;
        totalConflictFlags: number;
        totalUserInquiries: number;
        averageProcessingTime: number;
    };
    assignmentStatus: {
        unassigned: number;
        partially_assigned: number;
        fully_assigned: number;
    };
    completionStatus: {
        0: number;
        50: number;
        100: number;
    };
    releaseStatus: {
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
    generatedAt: string;
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
    recentSubmissions: Array<{
        _id: string;
        policyId: string;
        organization: string;
        createdAt: string;
    }>;
    lastUpdated: string;
}

export interface PerformanceMetrics {
    timeframe: string;
    processingPerformance: {
        avgProcessingTime: number;
        minProcessingTime: number;
        maxProcessingTime: number;
        totalReports: number;
    };
    successRates: {
        pending: number;
        withheld: number;
        released: number;
    };
    conflictDetectionRates: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    assignmentCompletion: {
        avgCompletionTime: number;
        minCompletionTime: number;
        maxCompletionTime: number;
    };
    dailyVolume: Array<{
        _id: string;
        count: number;
    }>;
    generatedAt: string;
}

export interface SystemHealth {
    systemStatus: 'healthy' | 'warning' | 'critical';
    alerts: string[];
    metrics: {
        recentActivity: number;
        stuckProcessing: number;
        unresolvedHighPriorityConflicts: number;
        unansweredInquiries: number;
        failedProcessing: number;
    };
    lastChecked: string;
}

export interface RecentActivity {
    activities: Array<{
        type: 'report_merged' | 'conflict_detected' | 'user_inquiry';
        timestamp: string;
        policyId: string;
        propertyAddress: string;
        status?: string;
        severity?: string;
        conflictType?: string;
        details: string;
    }>;
    totalCount: number;
    timeframe: string;
    lastUpdated: string;
}

class ProcessingMonitorService {
    private baseUrl = '/api/v1/processing-monitor';

    async getOverview(organization = 'all', timeframe = '24h'): Promise<{ success: boolean; data: ProcessingOverview }> {
        return apiRequest(`${this.baseUrl}/overview?organization=${organization}&timeframe=${timeframe}`, {
            method: 'GET',
        });
    }

    async getActiveProcessing(organization = 'all'): Promise<{ success: boolean; data: ActiveProcessing }> {
        return apiRequest(`${this.baseUrl}/active-processing?organization=${organization}`, {
            method: 'GET',
        });
    }

    async getPerformanceMetrics(timeframe = '7d', organization = 'all'): Promise<{ success: boolean; data: PerformanceMetrics }> {
        return apiRequest(`${this.baseUrl}/performance-metrics?timeframe=${timeframe}&organization=${organization}`, {
            method: 'GET',
        });
    }

    async getSystemHealth(): Promise<{ success: boolean; data: SystemHealth }> {
        return apiRequest(`${this.baseUrl}/system-health`, {
            method: 'GET',
        });
    }

    async getRecentActivity(limit = 50, organization = 'all'): Promise<{ success: boolean; data: RecentActivity }> {
        return apiRequest(`${this.baseUrl}/recent-activity?limit=${limit}&organization=${organization}`, {
            method: 'GET',
        });
    }
}

export const processingMonitorService = new ProcessingMonitorService();