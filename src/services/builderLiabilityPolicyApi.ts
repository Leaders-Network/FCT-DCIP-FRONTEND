import axios from "axios";
import { getAuthToken } from "@/utils/auth";
import { getCookie } from "@/utils/cookies";
import {
    BuilderIdentity,
    OrganizationInfo,
    MembershipInfo,
    CategoryOfWorkmen,
    Professional,
    WorkforceInfo,
    ComplianceInfo,
    ProjectInfo,
    MetaInfo,
    PaymentInfo,
    BuilderLiabilityPolicyData,
    BuilderLiabilityPolicy,
    ValidationError,
    ValidationWarning,
    ValidationResponse,
    CreatePolicyResponse,
    GetPoliciesResponse,
    SearchPoliciesResponse
} from "@/types/builderLiabilityPolicy.types";

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c";

// API Instance Configuration for Builder Liability Policy
const builderLiabilityApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "apikey": API_KEY,
    },
});

const getContextToken = (tokenType: 'user' | 'admin' | 'super-admin' | 'nia-admin' | 'surveyor' | 'broker-admin') => {
    // Strict token lookup by context to avoid accidental cross-role token usage
    // (for example, using an admin token on user dashboard routes).
    switch (tokenType) {
        case 'user':
            return getCookie('userToken') || getCookie('token') || getCookie('authToken');
        case 'admin':
            return getCookie('adminToken') || getCookie('token') || getCookie('authToken');
        case 'super-admin':
            return getCookie('superAdminToken') || getCookie('adminToken') || getCookie('token') || getCookie('authToken');
        case 'nia-admin':
            return getCookie('niaAdminToken') || getCookie('token') || getCookie('authToken');
        case 'surveyor':
            return getCookie('surveyorToken') || getCookie('token') || getCookie('authToken');
        case 'broker-admin':
            return getCookie('brokerAdminToken') || getCookie('token') || getCookie('authToken');
        default:
            return null;
    }
};

// Request interceptor
builderLiabilityApi.interceptors.request.use(
    (config) => {
        config.headers['apikey'] = API_KEY;

        // Determine token type based on current page context
        let tokenType: 'user' | 'admin' | 'super-admin' | 'nia-admin' | 'surveyor' | undefined;

        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

        if (currentPath.includes('/nia-admin')) {
            tokenType = 'nia-admin';
        } else if (currentPath.includes('/admin') && !currentPath.includes('/nia-admin')) {
            tokenType = 'admin';
        } else if (currentPath.includes('/surveyor')) {
            tokenType = 'surveyor';
        } else if (currentPath.includes('/super-admin')) {
            tokenType = 'super-admin';
        } else {
            tokenType = 'user';
        }

        const token = tokenType ? getContextToken(tokenType) : getAuthToken(tokenType);
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        console.error("Builder Liability API Request interceptor error:", error);
        return Promise.reject(error);
    }
);

// Response interceptor
builderLiabilityApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Builder Liability API Response Error:", {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method
        });
        return Promise.reject(error);
    }
);

// Builder Liability Policy API Functions
export const builderLiabilityPolicyAPI = {
    // Create new Builder Liability Policy
    createPolicy: async (policyData: BuilderLiabilityPolicyData): Promise<CreatePolicyResponse> => {
        try {
            const response = await builderLiabilityApi.post('/builder-liability-policy', policyData);
            return response.data;
        } catch (error) {
            console.error("Failed to create Builder Liability Policy:", error);
            throw error;
        }
    },

    // Get user's Builder Liability Policies
    getUserPolicies: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<GetPoliciesResponse> => {
        try {
            const queryParams = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== 'all') {
                        queryParams.append(key, value.toString());
                    }
                });
            }

            const url = `/builder-liability-policy/user${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await builderLiabilityApi.get(url);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch user Builder Liability Policies:", error);
            throw error;
        }
    },

    // Get all Builder Liability Policies (Admin only)
    getAllPolicies: async (params?: {
        page?: number;
        limit?: number;
        status?: string;
        search?: string;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }): Promise<GetPoliciesResponse> => {
        try {
            const queryParams = new URLSearchParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined && value !== 'all') {
                        queryParams.append(key, value.toString());
                    }
                });
            }

            const url = `/builder-liability-policy${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await builderLiabilityApi.get(url);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch all Builder Liability Policies:", error);
            throw error;
        }
    },

    // Get Builder Liability Policy by ID
    getPolicyById: async (policyId: string): Promise<{ success: boolean; data: { policy: BuilderLiabilityPolicy } }> => {
        try {
            const response = await builderLiabilityApi.get(`/builder-liability-policy/${policyId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch Builder Liability Policy:", error);
            throw error;
        }
    },

    // Update Builder Liability Policy
    updatePolicy: async (policyId: string, updateData: Partial<BuilderLiabilityPolicyData>): Promise<{
        success: boolean;
        message: string;
        data: { policy: BuilderLiabilityPolicy };
        warnings?: ValidationWarning[];
    }> => {
        try {
            const response = await builderLiabilityApi.put(`/builder-liability-policy/${policyId}`, updateData);
            return response.data;
        } catch (error) {
            console.error("Failed to update Builder Liability Policy:", error);
            throw error;
        }
    },

    // Update Builder Liability Policy Status (Admin only)
    updatePolicyStatus: async (policyId: string, status: string, reason?: string): Promise<{
        success: boolean;
        message: string;
        data: { policy: BuilderLiabilityPolicy };
    }> => {
        try {
            const response = await builderLiabilityApi.patch(`/builder-liability-policy/${policyId}/status`, {
                status,
                reason
            });
            return response.data;
        } catch (error) {
            console.error("Failed to update Builder Liability Policy status:", error);
            throw error;
        }
    },

    // Search Builder Liability Policies
    searchPolicies: async (searchTerm: string, limit = 10): Promise<SearchPoliciesResponse> => {
        try {
            const response = await builderLiabilityApi.get(`/builder-liability-policy/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error("Failed to search Builder Liability Policies:", error);
            throw error;
        }
    },

    // Delete Builder Liability Policy
    deletePolicy: async (policyId: string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await builderLiabilityApi.delete(`/builder-liability-policy/${policyId}`);
            return response.data;
        } catch (error) {
            console.error("Failed to delete Builder Liability Policy:", error);
            throw error;
        }
    },

    // Validate Builder Liability Policy Data
    validatePolicyData: async (policyData: BuilderLiabilityPolicyData): Promise<{
        success: boolean;
        data: ValidationResponse;
    }> => {
        try {
            const response = await builderLiabilityApi.post('/builder-liability-policy/validate', policyData);
            return response.data;
        } catch (error) {
            console.error("Failed to validate Builder Liability Policy data:", error);
            throw error;
        }
    },

    // Validate specific section of Builder Liability Policy
    validateSection: async (section: string, sectionData: Partial<BuilderLiabilityPolicyData>): Promise<{
        success: boolean;
        data: ValidationResponse & { section: string };
    }> => {
        try {
            const response = await builderLiabilityApi.post(`/builder-liability-policy/validate/${section}`, sectionData);
            return response.data;
        } catch (error) {
            console.error("Failed to validate Builder Liability Policy section:", error);
            throw error;
        }
    },

    confirmEgolepayPayment: async (
        reference: string,
        gatewayResponse: Record<string, unknown>,
        policyId?: string
    ): Promise<{
        success: boolean;
        message: string;
        data?: unknown;
        niipWithdrawal?: {
            success?: boolean;
            skipped?: boolean;
            reason?: string;
            status?: number;
            body?: {
                error?: string;
                message?: string;
                raw?: string;
                niipUrl?: string;
                statusCode?: number;
                looksLike404Page?: boolean;
                [key: string]: unknown;
            };
            error?: string;
        };
    }> => {
        try {
            const response = await builderLiabilityApi.post('/payment/Egolepay/confirm', {
                reference,
                gatewayResponse,
                policyId
            });
            return response.data;
        } catch (error) {
            console.error("Failed to confirm EgolePay payment:", error);
            throw error;
        }
    }
};

// Legacy Policy Request API (for backward compatibility)
export const legacyPolicyAPI = {
    // Get deprecation notice for old endpoints
    getDeprecationNotice: async (): Promise<{
        success: boolean;
        message: string;
        redirectTo: string;
        deprecated: boolean;
    }> => {
        try {
            const response = await builderLiabilityApi.post('/policy');
            return response.data;
        } catch (error) {
            console.error("Legacy policy endpoint error:", error);
            throw error;
        }
    }
};

export default builderLiabilityPolicyAPI;
