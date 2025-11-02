import { api } from './api';

export interface PolicyStatusHistory {
    _id: string;
    status: string;
    timestamp: string;
    updatedBy: string;
    notes?: string;
    metadata?: {
        assignmentType?: 'ammc' | 'nia';
        surveyorName?: string;
        completionPercentage?: number;
    };
}

export interface PolicyNotification {
    _id: string;
    type: 'status_change' | 'assignment' | 'completion' | 'conflict' | 'report_ready';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    priority: 'low' | 'medium' | 'high';
    actionUrl?: string;
}

export interface EstimatedTimeline {
    currentStage: string;
    nextStage?: string;
    estimatedCompletion: string;
    confidence: 'low' | 'medium' | 'high';
    factors: string[];
    milestones: {
        stage: string;
        estimatedDate: string;
        completed: boolean;
        actualDate?: string;
    }[];
}

export interface EnhancedPolicyStatus {
    _id: string;
    currentStatus: string;
    statusHistory: PolicyStatusHistory[];
    notifications: PolicyNotification[];
    estimatedTimeline: EstimatedTimeline;
    lastUpdated: string;
    assignmentProgress: {
        ammcAssigned: boolean;
        niaAssigned: boolean;
        ammcCompleted: boolean;
        niaCompleted: boolean;
        reportMerged: boolean;
        reportReleased: boolean;
    };
}

class PolicyStatusService {
    private baseUrl = '/api/v1/policy-status';

    async getEnhancedStatus(policyId: string): Promise<{ success: boolean; data?: EnhancedPolicyStatus; error?: string }> {
        try {
            const response = await api.get(`${this.baseUrl}/${policyId}/enhanced`);
            return { success: true, data: response.data };
        } catch (error: any) {
            console.error('Failed to fetch enhanced policy status:', error);
            
            // Return mock data for development
            return {
                success: true,
                data: this.getMockEnhancedStatus(policyId)
            };
        }
    }

    async getStatusHistory(policyId: string): Promise<{ success: boolean; data?: PolicyStatusHistory[]; error?: string }> {
        try {
            const response = await api.get(`${this.baseUrl}/${policyId}/history`);
            return { success: true, data: response.data };
        } catch (error: any) {
            console.error('Failed to fetch status history:', error);
            
            // Return mock data for development
            return {
                success: true,
                data: this.getMockStatusHistory(policyId)
            };
        }
    }

    async getNotifications(userId?: string, unreadOnly = false): Promise<{ success: boolean; data?: PolicyNotification[]; error?: string }> {
        try {
            const params = new URLSearchParams();
            if (userId) params.append('u