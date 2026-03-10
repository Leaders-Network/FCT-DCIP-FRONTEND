import axios from "axios";
import { getAuthToken } from "@/utils/auth";
import { API_CONFIG } from "@/constants";
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
const API_BASE_URL = API_CONFIG.BASE_URL;
const API_KEY = API_CONFIG.API_KEY;

// API Instance Configuration for Builder Liability Policy
const builderLiabilityApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "apikey": API_KEY,
    },
});

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

        const token = getAuthToken(tokenType);
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
