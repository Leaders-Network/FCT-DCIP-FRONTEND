import { useState, useEffect, useCallback } from 'react';
import { builderLiabilityPolicyAPI } from '@/services/builderLiabilityPolicyApi';
import {
    BuilderLiabilityPolicy,
    BuilderLiabilityPolicyData,
    PolicyFilters,
    AdminPolicyFilters,
    ValidationResponse,
    CreatePolicyResponse,
    GetPoliciesResponse,
    SearchPoliciesResponse,
    BuilderLiabilityPolicyStatus
} from '@/types/builderLiabilityPolicy.types';

// Hook for managing a single Builder Liability Policy
const useBuilderLiabilityPolicy = (policyId?: string) => {
    const [policy, setPolicy] = useState<BuilderLiabilityPolicy | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPolicy = useCallback(async () => {
        if (!policyId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await builderLiabilityPolicyAPI.getPolicyById(policyId);
            setPolicy(response.data.policy);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch policy';
            setError(errorMessage);
            console.error('Error fetching Builder Liability Policy:', err);
        } finally {
            setLoading(false);
        }
    }, [policyId]);

    const updatePolicy = useCallback(async (updateData: Partial<BuilderLiabilityPolicyData>) => {
        if (!policyId) return null;

        setLoading(true);
        setError(null);

        try {
            // Convert string dates to Date objects if needed
            const processedData = { ...updateData };
            if (processedData.organization?.yearOfIncorporation && typeof processedData.organization.yearOfIncorporation === 'string') {
                processedData.organization.yearOfIncorporation = new Date(processedData.organization.yearOfIncorporation);
            }
            if (processedData.meta?.date && typeof processedData.meta.date === 'string') {
                processedData.meta.date = new Date(processedData.meta.date);
            }

            const response = await builderLiabilityPolicyAPI.updatePolicy(policyId, processedData);
            setPolicy(response.data.policy);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update policy';
            setError(errorMessage);
            console.error('Error updating Builder Liability Policy:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [policyId]);

    const updateStatus = useCallback(async (status: string, reason?: string) => {
        if (!policyId) return null;

        setLoading(true);
        setError(null);

        try {
            const response = await builderLiabilityPolicyAPI.updatePolicyStatus(policyId, status, reason);
            setPolicy(response.data.policy);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update policy status';
            setError(errorMessage);
            console.error('Error updating policy status:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [policyId]);

    const deletePolicy = useCallback(async () => {
        if (!policyId) return null;

        setLoading(true);
        setError(null);

        try {
            const response = await builderLiabilityPolicyAPI.deletePolicy(policyId);
            setPolicy(null);
            return response;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete policy';
            setError(errorMessage);
            console.error('Error deleting Builder Liability Policy:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [policyId]);

    useEffect(() => {
        if (policyId) {
            fetchPolicy();
        }
    }, [fetchPolicy, policyId]);

    return {
        policy,
        loading,
        error,
        fetchPolicy,
        updatePolicy,
        updateStatus,
        deletePolicy,
        setError
    };
};

// Hook for managing multiple Builder Liability Policies
const useBuilderLiabilityPolicies = (isAdmin = false) => {
    const [policies, setPolicies] = useState<BuilderLiabilityPolicy[]>([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalPolicies: 0,
        hasMore: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPolicies = useCallback(async (filters?: PolicyFilters | AdminPolicyFilters) => {
        setLoading(true);
        setError(null);

        try {
            let response: GetPoliciesResponse;

            if (isAdmin) {
                response = await builderLiabilityPolicyAPI.getAllPolicies(filters);
            } else {
                response = await builderLiabilityPolicyAPI.getUserPolicies(filters);
            }

            setPolicies(response.data.policies);
            setPagination(response.data.pagination);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch policies';
            setError(errorMessage);
            console.error('Error fetching Builder Liability Policies:', err);
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    const searchPolicies = useCallback(async (searchTerm: string, limit = 10) => {
        setLoading(true);
        setError(null);

        try {
            const response: SearchPoliciesResponse = await builderLiabilityPolicyAPI.searchPolicies(searchTerm, limit);
            setPolicies(response.data.policies);
            // Reset pagination for search results
            setPagination({
                currentPage: 1,
                totalPages: 1,
                totalPolicies: response.data.policies.length,
                hasMore: false
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to search policies';
            setError(errorMessage);
            console.error('Error searching Builder Liability Policies:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshPolicies = useCallback(() => {
        fetchPolicies();
    }, [fetchPolicies]);

    return {
        policies,
        pagination,
        loading,
        error,
        fetchPolicies,
        searchPolicies,
        refreshPolicies,
        setError
    };
};

// Hook for creating Builder Liability Policies
const useCreateBuilderLiabilityPolicy = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationResponse | null>(null);

    const createPolicy = useCallback(async (policyData: BuilderLiabilityPolicyData) => {
        setLoading(true);
        setError(null);
        setValidationErrors(null);

        try {
            // Convert string dates to Date objects if needed
            const processedData = { ...policyData };
            if (typeof processedData.organization.yearOfIncorporation === 'string') {
                processedData.organization.yearOfIncorporation = new Date(processedData.organization.yearOfIncorporation);
            }
            if (typeof processedData.meta.date === 'string') {
                processedData.meta.date = new Date(processedData.meta.date);
            }

            const response: CreatePolicyResponse = await builderLiabilityPolicyAPI.createPolicy(processedData);
            return response;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create policy';
            setError(errorMessage);

            // Handle validation errors
            if (err && typeof err === 'object' && 'response' in err) {
                const responseErr = err as { response?: { data?: { errors?: unknown; warnings?: unknown; message?: string } } };
                if (responseErr.response?.data?.errors) {
                    setValidationErrors({
                        isValid: false,
                        errors: responseErr.response.data.errors as { field: string; message: string }[],
                        warnings: (responseErr.response.data.warnings as { field: string; message: string }[]) || []
                    });
                }
            }

            console.error('Error creating Builder Liability Policy:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const validatePolicyData = useCallback(async (policyData: BuilderLiabilityPolicyData) => {
        setLoading(true);
        setError(null);

        try {
            // Convert string dates to Date objects if needed
            const processedData = { ...policyData };
            if (typeof processedData.organization.yearOfIncorporation === 'string') {
                processedData.organization.yearOfIncorporation = new Date(processedData.organization.yearOfIncorporation);
            }
            if (typeof processedData.meta.date === 'string') {
                processedData.meta.date = new Date(processedData.meta.date);
            }

            const response = await builderLiabilityPolicyAPI.validatePolicyData(processedData);
            setValidationErrors(response.data);
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to validate policy data';
            setError(errorMessage);
            console.error('Error validating policy data:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const validateSection = useCallback(async (section: string, sectionData: Partial<BuilderLiabilityPolicyData>) => {
        setLoading(true);
        setError(null);

        try {
            const response = await builderLiabilityPolicyAPI.validateSection(section, sectionData);
            return response.data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to validate section';
            setError(errorMessage);
            console.error('Error validating section:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        validationErrors,
        createPolicy,
        validatePolicyData,
        validateSection,
        setError,
        setValidationErrors
    };
};

// Hook for policy statistics and dashboard data
const useBuilderLiabilityPolicyStats = () => {
    const [stats, setStats] = useState<{
        total: number;
        byStatus: Record<string, number>;
        byPriority: Record<string, number>;
        recentPolicies: BuilderLiabilityPolicy[];
        overdueCount: number;
        completionRate: number;
    } | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // This would need to be implemented in the backend
            // For now, we'll calculate basic stats from the policies
            const response = await builderLiabilityPolicyAPI.getAllPolicies({ limit: 1000 });
            const policies = response.data.policies;

            const statusCounts = policies.reduce((acc, policy) => {
                const status = policy.status || 'draft';
                acc[status] = (acc[status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const priorityCounts = policies.reduce((acc, policy) => {
                const priority = policy.priority || 'medium';
                acc[priority] = (acc[priority] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const overdueCount = policies.filter(policy => {
                const deadline = new Date(policy.deadline);
                const now = new Date();
                const status = policy.status || 'draft';
                return deadline < now && !['completed', 'approved', 'rejected'].includes(status);
            }).length;

            const completedCount = policies.filter(policy => {
                const status = policy.status || 'draft';
                return ['completed', 'approved'].includes(status);
            }).length;

            const completionRate = policies.length > 0 ? (completedCount / policies.length) * 100 : 0;

            setStats({
                total: policies.length,
                byStatus: statusCounts,
                byPriority: priorityCounts,
                recentPolicies: policies.slice(0, 5),
                overdueCount,
                completionRate: Math.round(completionRate * 100) / 100
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
            setError(errorMessage);
            console.error('Error fetching policy statistics:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        refreshStats: fetchStats
    };
};

// Export all hooks
export {
    useBuilderLiabilityPolicy,
    useBuilderLiabilityPolicies,
    useCreateBuilderLiabilityPolicy,
    useBuilderLiabilityPolicyStats
};