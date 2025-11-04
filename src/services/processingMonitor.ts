import { apiRequest } from '@/services/api';
import {
    ProcessingOverview,
    ActiveProcessing,
    PerformanceMetrics,
    SystemHealth,
    RecentActivity
} from '@/types/api.types';

export class ProcessingMonitorService {
    private baseUrl = '/processing-monitor';

    async getOverview(organization = 'NIA', timeframe = '24h'): Promise<{ success: boolean; data: ProcessingOverview }> {
        return apiRequest<ProcessingOverview>(`${this.baseUrl}/overview?organization=${organization}&timeframe=${timeframe}`);
    }

    async getActiveProcessing(organization = 'NIA'): Promise<{ success: boolean; data: ActiveProcessing }> {
        return apiRequest<ActiveProcessing>(`${this.baseUrl}/active?organization=${organization}`);
    }

    async getPerformanceMetrics(timeframe = '24h', organization = 'NIA'): Promise<{ success: boolean; data: PerformanceMetrics }> {
        return apiRequest<PerformanceMetrics>(`${this.baseUrl}/performance?timeframe=${timeframe}&organization=${organization}`);
    }

    async getSystemHealth(): Promise<{ success: boolean; data: SystemHealth }> {
        return apiRequest<SystemHealth>(`${this.baseUrl}/health`);
    }

    async getRecentActivity(limit = 50, organization = 'NIA'): Promise<{ success: boolean; data: RecentActivity }> {
        return apiRequest<RecentActivity>(`${this.baseUrl}/activity?limit=${limit}&organization=${organization}`);
    }

    async triggerProcessing(policyId?: string): Promise<{ success: boolean; data: unknown }> {
        return apiRequest(`${this.baseUrl}/trigger`, {
            method: 'POST',
            body: JSON.stringify({ policyId })
        });
    }

    async getProcessingStatus(processId: string): Promise<{ success: boolean; data: unknown }> {
        return apiRequest(`${this.baseUrl}/status/${processId}`);
    }
}

// Export singleton instance
export const processingMonitorService = new ProcessingMonitorService();

// Export types for convenience
export type { ProcessingOverview, ActiveProcessing, PerformanceMetrics, SystemHealth, RecentActivity };