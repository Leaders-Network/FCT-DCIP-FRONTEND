import { apiRequest } from './api';

export interface ConflictInquiry {
    _id: string;
    referenceId: string;
    conflictType: string;
    description: string;
    urgency: 'low' | 'medium' | 'high';
    inquiryStatus: 'open' | 'in_progress' | 'resolved' | 'closed';
    contactPreference: 'email' | 'phone' | 'both';
    userContact: {
        email: string;
        phone: string;
        preferredTime: string;
    };
    userId: {
        _id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
    };
    policyId: {
        _id: string;
        propertyDetails: {
            address: string;
            propertyType: string;
            buildingValue: number;
        };
        contactDetails: {
            fullName: string;
            email: string;
            phoneNumber: string;
        };
        status: string;
    };
    assignedAdminId?: {
        _id: string;
        firstname: string;
        lastname: string;
        email: string;
    };
    assignedOrganization: 'AMMC' | 'NIA' | 'BOTH';
    adminResponse?: string;
    responseMethod?: string;
    internalNotes: Array<{
        note: string;
        addedBy: {
            firstname: string;
            lastname: string;
        };
        addedAt: string;
        noteType: string;
    }>;
    escalationLevel: number;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    createdAt: string;
    updatedAt: string;
    daysSinceCreation: number;
    responseTimeHours?: number;
}

export interface ConflictInquirySubmission {
    policyId: string;
    mergedReportId: string;
    conflictType: string;
    description: string;
    urgency: 'low' | 'medium' | 'high';
    contactPreference: 'email' | 'phone' | 'both';
    userContact: {
        email: string;
        phone: string;
        preferredTime: string;
    };
}

export interface InquiryFilters {
    status?: string;
    urgency?: string;
    conflictType?: string;
    organization?: string;
    page?: number;
    limit?: number;
    search?: string;
}

export interface InquiryStats {
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
}

export interface InquiryResponse {
    inquiries: ConflictInquiry[];
    pagination: {
        current: number;
        pages: number;
        total: number;
    };
    stats: InquiryStats;
}

// Submit a new conflict inquiry (user-facing)
export const submitConflictInquiry = async (inquiryData: ConflictInquirySubmission) => {
    try {
        const response = await apiRequest('/user-conflict-inquiries', {
            method: 'POST',
            body: JSON.stringify(inquiryData)
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to submit conflict inquiry');
        }

        return response.data;
    } catch (error) {
        console.error('Error submitting conflict inquiry:', error);
        throw error;
    }
};

// Get all conflict inquiries for admin
export const getConflictInquiries = async (filters: InquiryFilters = {}): Promise<InquiryResponse> => {
    try {
        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value.toString());
            }
        });

        const response = await apiRequest(`/user-conflict-inquiries/admin?${queryParams.toString()}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch conflict inquiries');
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching conflict inquiries:', error);
        throw error;
    }
};

// Get specific inquiry details
export const getConflictInquiryDetails = async (inquiryId: string): Promise<ConflictInquiry> => {
    try {
        const response = await apiRequest(`/user-conflict-inquiries/admin/${inquiryId}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch inquiry details');
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching inquiry details:', error);
        throw error;
    }
};

// Assign inquiry to admin
export const assignInquiry = async (inquiryId: string, organization: 'AMMC' | 'NIA' | 'BOTH' = 'AMMC') => {
    try {
        const response = await apiRequest(`/user-conflict-inquiries/admin/${inquiryId}/assign`, {
            method: 'PUT',
            body: JSON.stringify({ organization })
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to assign inquiry');
        }

        return response.data;
    } catch (error) {
        console.error('Error assigning inquiry:', error);
        throw error;
    }
};

// Send response to user
export const sendInquiryResponse = async (
    inquiryId: string,
    responseText: string,
    method: 'email' | 'phone' | 'in_person' = 'email'
) => {
    try {
        const response = await apiRequest(`/user-conflict-inquiries/admin/${inquiryId}/respond`, {
            method: 'PUT',
            body: JSON.stringify({
                response: responseText,
                method: method
            })
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to send response');
        }

        return response.data;
    } catch (error) {
        console.error('Error sending response:', error);
        throw error;
    }
};

// Add internal note to inquiry
export const addInternalNote = async (
    inquiryId: string,
    note: string,
    noteType: 'general' | 'follow_up' | 'escalation' | 'resolution' = 'general'
) => {
    try {
        const response = await apiRequest(`/user-conflict-inquiries/admin/${inquiryId}/add-note`, {
            method: 'PUT',
            body: JSON.stringify({
                note: note,
                noteType: noteType
            })
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to add note');
        }

        return response.data;
    } catch (error) {
        console.error('Error adding note:', error);
        throw error;
    }
};

// Escalate inquiry
export const escalateInquiry = async (
    inquiryId: string,
    escalatedTo: string,
    reason: string
) => {
    try {
        const response = await apiRequest(`/user-conflict-inquiries/admin/${inquiryId}/escalate`, {
            method: 'PUT',
            body: JSON.stringify({
                escalatedTo: escalatedTo,
                reason: reason
            })
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to escalate inquiry');
        }

        return response.data;
    } catch (error) {
        console.error('Error escalating inquiry:', error);
        throw error;
    }
};

// Close inquiry
export const closeInquiry = async (inquiryId: string, closureReason?: string) => {
    try {
        const response = await apiRequest(`/user-conflict-inquiries/admin/${inquiryId}/close`, {
            method: 'PUT',
            body: JSON.stringify({
                closureReason: closureReason
            })
        });

        if (!response.success) {
            throw new Error(response.message || 'Failed to close inquiry');
        }

        return response.data;
    } catch (error) {
        console.error('Error closing inquiry:', error);
        throw error;
    }
};

// Get inquiry statistics
export const getInquiryStats = async (
    organization?: 'AMMC' | 'NIA' | 'all',
    timeframe: '1h' | '24h' | '7d' | '30d' = '30d'
) => {
    try {
        const queryParams = new URLSearchParams();

        if (organization && organization !== 'all') {
            queryParams.append('organization', organization);
        }
        queryParams.append('timeframe', timeframe);

        const response = await apiRequest(`/user-conflict-inquiries/admin/stats?${queryParams.toString()}`);

        if (!response.success) {
            throw new Error(response.message || 'Failed to fetch inquiry statistics');
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching inquiry statistics:', error);
        throw error;
    }
};

// Utility function to get conflict type labels
export const getConflictTypeLabel = (type: string): string => {
    const labels: { [key: string]: string } = {
        'disagreement_findings': 'Disagreement with Findings',
        'recommendation_concern': 'Recommendation Concern',
        'surveyor_conduct': 'Surveyor Conduct',
        'technical_error': 'Technical Error',
        'missing_information': 'Missing Information',
        'clarification_needed': 'Clarification Needed',
        'other': 'Other'
    };
    return labels[type] || type;
};

// Utility function to get status color classes
export const getStatusColorClass = (status: string): string => {
    switch (status) {
        case 'open': return 'bg-red-100 text-red-800';
        case 'in_progress': return 'bg-yellow-100 text-yellow-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        case 'closed': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// Utility function to get urgency color classes
export const getUrgencyColorClass = (urgency: string): string => {
    switch (urgency) {
        case 'high': return 'text-red-600';
        case 'medium': return 'text-yellow-600';
        case 'low': return 'text-green-600';
        default: return 'text-gray-600';
    }
};

// Utility function to format response time
export const formatResponseTime = (hours?: number): string => {
    if (!hours) return 'N/A';

    if (hours < 24) {
        return `${Math.round(hours)} hours`;
    } else {
        const days = Math.floor(hours / 24);
        const remainingHours = Math.round(hours % 24);
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days} days`;
    }
};

// Utility function to calculate days since creation
export const getDaysSinceCreation = (createdAt: string): number => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};