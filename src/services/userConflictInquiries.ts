import { apiRequest } from '@/services/api';

export interface UserInquiry {
    _id: string;
    policyId: string;
    mergedReportId?: string;
    userId: {
        _id: string;
        fullName: string;
        email: string;
        phoneNumber?: string;
    };
    conflictType: string;
    description: string;
    urgency: 'low' | 'medium' | 'high';
    contactPreference: 'email' | 'phone' | 'both';
    userContact: {
        email: string;
        phone: string;
        preferredTime?: string;
    };
    inquiryStatus: 'open' | 'in_progress' | 'resolved' | 'closed';
    assignedAdminId?: string;
    assignedOrganization?: 'AMMC' | 'NIA' | 'BOTH';
    adminResponse?: string;
    responseMethod?: 'email' | 'phone' | 'in_person';
    createdAt: string;
    updatedAt: string;
    respondedAt?: string;
    referenceId: string;
    internalNotes?: Array<{
        note: string;
        addedBy: string;
        addedAt: string;
        noteType: 'general' | 'follow_up' | 'escalation' | 'resolution';
    }>;
    escalationLevel?: number;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface InquiryFilters {
    status?: string;
    urgency?: string;
    conflictType?: string;
    organization?: string;
    search?: string;
    page?: number;
    limit?: number;
}

export interface InquiryStats {
    totalInquiries: number;
    statusBreakdown: {
        open: number;
        in_progress: number;
        resolved: number;
        closed: number;
    };
    typeBreakdown: Record<string, number>;
    urgencyBreakdown: {
        low: number;
        medium: number;
        high: number;
    };
    responseTimeMetrics: {
        avgResponseTime: number;
        minResponseTime: number;
        maxResponseTime: number;
    };
    dailyVolume: Array<{
        _id: string;
        count: number;
    }>;
    generatedAt: string;
}

export interface InquiryResponse {
    success: boolean;
    data: {
        inquiries: UserInquiry[];
        pagination: {
            current: number;
            pages: number;
            total: number;
        };
        stats: {
            open: number;
            in_progress: number;
            resolved: number;
            closed: number;
        };
    };
    message?: string;
}

class UserConflictInquiriesService {
    private baseUrl = '/user-conflict-inquiries';

    async getInquiries(filters: InquiryFilters = {}): Promise<InquiryResponse> {
        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        const url = `${this.baseUrl}/admin${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        return apiRequest(url, {
            method: 'GET',
        });
    }

    async getInquiryById(id: string): Promise<{ success: boolean; data: UserInquiry }> {
        return apiRequest(`${this.baseUrl}/admin/${id}`, {
            method: 'GET',
        });
    }

    async getInquiryStats(organization = 'all', timeframe = '30d'): Promise<{ success: boolean; data: InquiryStats }> {
        return apiRequest(`${this.baseUrl}/admin/stats?organization=${organization}&timeframe=${timeframe}`, {
            method: 'GET',
        });
    }

    async assignInquiry(id: string, organization: 'AMMC' | 'NIA' | 'BOTH' = 'NIA'): Promise<{ success: boolean; data: UserInquiry }> {
        return apiRequest(`${this.baseUrl}/admin/${id}/assign`, {
            method: 'PUT',
            body: JSON.stringify({ organization }),
        });
    }

    async respondToInquiry(id: string, response: string, method: 'email' | 'phone' | 'in_person' = 'email'): Promise<{ success: boolean; data: UserInquiry }> {
        return apiRequest(`${this.baseUrl}/admin/${id}/respond`, {
            method: 'PUT',
            body: JSON.stringify({ response, method }),
        });
    }

    async addInternalNote(id: string, note: string, noteType: 'general' | 'follow_up' | 'escalation' | 'resolution' = 'general'): Promise<{ success: boolean; data: UserInquiry }> {
        return apiRequest(`${this.baseUrl}/admin/${id}/add-note`, {
            method: 'PUT',
            body: JSON.stringify({ note, noteType }),
        });
    }

    async escalateInquiry(id: string, escalatedTo: string, reason: string): Promise<{ success: boolean; data: UserInquiry }> {
        return apiRequest(`${this.baseUrl}/admin/${id}/escalate`, {
            method: 'PUT',
            body: JSON.stringify({ escalatedTo, reason }),
        });
    }

    async closeInquiry(id: string, closureReason?: string): Promise<{ success: boolean; data: UserInquiry }> {
        return apiRequest(`${this.baseUrl}/admin/${id}/close`, {
            method: 'PUT',
            body: JSON.stringify({ closureReason }),
        });
    }

    // User-facing methods
    async submitInquiry(inquiryData: {
        policyId: string;
        mergedReportId?: string;
        conflictType: string;
        description: string;
        urgency?: 'low' | 'medium' | 'high';
        contactPreference?: 'email' | 'phone' | 'both';
        userContact: {
            email: string;
            phone?: string;
            preferredTime?: string;
        };
    }): Promise<{ success: boolean; data: { referenceId: string; inquiryId: string; expectedResponseTime: string } }> {
        return apiRequest(this.baseUrl, {
            method: 'POST',
            body: JSON.stringify(inquiryData),
        });
    }
}

export const userConflictInquiriesService = new UserConflictInquiriesService();