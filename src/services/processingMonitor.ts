import { apiRequest } from '@/services/api';
import {
    ProcessingOverview,
    ActiveProcessing,
    PerformanceMetrics,
    SystemHealth,
    RecentActivity
} from '@/types/api.types';

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

interface ProcessingTriggerResponse {
    processId: string;
    status: string;
    message: string;
}

interface ProcessingStatusResponse {
    processId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress: number;
    message?: string;
    result?: unknown;
}

export class ProcessingMonitorService {
    private baseUrl = '/processing-monitor';

    async getOverview(organization = 'NIA', timeframe = '24h'): Promise<ApiResponse<ProcessingOverview>> {
        return apiRequest<ProcessingOverview>(`${this.baseUrl}/overview?organization=${organization}&timeframe=${timeframe}`);
    }

    async getActiveProcessing(organization = 'NIA'): Promise<ApiResponse<ActiveProcessing>> {
        return apiRequest<ActiveProcessing>(`${this.baseUrl}/active?organization=${organization}`);
    }

    async getPerformanceMetrics(timeframe = '24h', organization = 'NIA'): Promise<ApiResponse<PerformanceMetrics>> {
        return apiRequest<PerformanceMetrics>(`${this.baseUrl}/performance?timeframe=${timeframe}&organization=${organization}`);
    }

    async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
        return apiRequest<SystemHealth>(`${this.baseUrl}/health`);
    }

    async getRecentActivity(limit = 50, organization = 'NIA'): Promise<ApiResponse<RecentActivity>> {
        return apiRequest<RecentActivity>(`${this.baseUrl}/activity?limit=${limit}&organization=${organization}`);
    }

    async triggerProcessing(policyId?: string): Promise<ApiResponse<ProcessingTriggerResponse>> {
        return apiRequest<ProcessingTriggerResponse>(`${this.baseUrl}/trigger`, {
            method: 'POST',
            body: JSON.stringify({ policyId })
        });
    }

    async getProcessingStatus(processId: string): Promise<ApiResponse<ProcessingStatusResponse>> {
        return apiRequest<ProcessingStatusResponse>(`${this.baseUrl}/status/${processId}`);
    }
}

// Export singleton instance
export const processingMonitorService = new ProcessingMonitorService();

// Export types for convenience
export type { ProcessingOverview, ActiveProcessing, PerformanceMetrics, SystemHealth, RecentActivity };