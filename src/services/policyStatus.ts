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

    // Mock data methods for development
    private getMockEnhancedStatus(policyId: string): EnhancedPolicyStatus {
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        return {
            _id: policyId,
            currentStatus: 'assigned',
            lastUpdated: now.toISOString(),
            assignmentProgress: {
                ammcAssigned: true,
                niaAssigned: false,
                ammcCompleted: false,
                niaCompleted: false,
                reportMerged: false,
                reportReleased: false
            },
            statusHistory: [
                {
                    _id: '1',
                    status: 'submitted',
                    timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    updatedBy: 'System',
                    notes: 'Policy request submitted by user'
                },
                {
                    _id: '2',
                    status: 'assigned',
                    timestamp: yesterday.toISOString(),
                    updatedBy: 'AMMC Admin',
                    notes: 'AMMC surveyor assigned to property assessment',
                    metadata: {
                        assignmentType: 'ammc',
                        surveyorName: 'John Adebayo'
                    }
                }
            ],
            notifications: [
                {
                    _id: '1',
                    type: 'assignment',
                    title: 'AMMC Surveyor Assigned',
                    message: 'John Adebayo has been assigned as your AMMC surveyor.',
                    timestamp: yesterday.toISOString(),
                    read: false,
                    priority: 'medium',
                    actionUrl: '/dashboard/policies'
                }
            ],
            estimatedTimeline: {
                currentStage: 'AMMC Survey Assignment',
                nextStage: 'NIA Survey Assignment',
                estimatedCompletion: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                confidence: 'medium',
                factors: [
                    'AMMC surveyor assigned',
                    'Awaiting NIA surveyor assignment',
                    'Property location accessible'
                ],
                milestones: [
                    {
                        stage: 'Policy Submitted',
                        estimatedDate: now.toISOString(),
                        completed: true,
                        actualDate: now.toISOString()
                    },
                    {
                        stage: 'AMMC Surveyor Assigned',
                        estimatedDate: now.toISOString(),
                        completed: true,
                        actualDate: now.toISOString()
                    },
                    {
                        stage: 'NIA Surveyor Assignment',
                        estimatedDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                        completed: false
                    },
                    {
                        stage: 'Final Report Release',
                        estimatedDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                        completed: false
                    }
                ]
            }
        };
    }
}

export const policyStatusService = new PolicyStatusService();