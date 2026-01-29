import { useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';

export interface FilterOptions {
    statuses: string[];
    lgas: string[];
    coverTypes: string[];
    surveyorRecommendations: string[];
    brokerStatuses: string[];
    priorities: string[];
    assignmentStatuses: string[];
}

export interface SearchFilters {
    search?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    lga?: string;
    builderName?: string;
    policyNumber?: string;
    surveyorRecommendation?: string;
    brokerStatus?: string;
    claimRequested?: boolean;
    minValue?: number;
    maxValue?: number;
    coverType?: string;
    priority?: string;
    overdue?: boolean;
}

export interface PaginationOptions {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

export interface UseSearchFilterProps {
    initialFilters?: SearchFilters;
    initialPagination?: Partial<PaginationOptions>;
    onFiltersChange?: (filters: SearchFilters, pagination: PaginationOptions) => void;
    debounceMs?: number;
}

export const useSearchFilter = ({
    initialFilters = {},
    initialPagination = {},
    onFiltersChange,
    debounceMs = 500
}: UseSearchFilterProps = {}) => {
    const [filters, setFilters] = useState<SearchFilters>(initialFilters);
    const [pagination, setPagination] = useState<PaginationOptions>({
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...initialPagination
    });
    const [isLoading, setIsLoading] = useState(false);

    // Debounced callback for filter changes
    const debouncedOnFiltersChange = useCallback(
        debounce((newFilters: SearchFilters, newPagination: PaginationOptions) => {
            if (onFiltersChange) {
                onFiltersChange(newFilters, newPagination);
            }
        }, debounceMs),
        [onFiltersChange, debounceMs]
    );

    // Update filters
    const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
        setFilters(prev => {
            const updated = { ...prev, ...newFilters };
            // Reset to first page when filters change
            const newPagination = { ...pagination, page: 1 };
            setPagination(newPagination);
            debouncedOnFiltersChange(updated, newPagination);
            return updated;
        });
    }, [pagination, debouncedOnFiltersChange]);

    // Update single filter
    const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
        updateFilters({ [key]: value });
    }, [updateFilters]);

    // Update pagination
    const updatePagination = useCallback((newPagination: Partial<PaginationOptions>) => {
        setPagination(prev => {
            const updated = { ...prev, ...newPagination };
            debouncedOnFiltersChange(filters, updated);
            return updated;
        });
    }, [filters, debouncedOnFiltersChange]);

    // Clear all filters
    const clearFilters = useCallback(() => {
        const clearedFilters = {};
        const resetPagination = { ...pagination, page: 1 };
        setFilters(clearedFilters);
        setPagination(resetPagination);
        debouncedOnFiltersChange(clearedFilters, resetPagination);
    }, [pagination, debouncedOnFiltersChange]);

    // Clear single filter
    const clearFilter = useCallback((key: keyof SearchFilters) => {
        const newFilters = { ...filters };
        delete newFilters[key];
        setFilters(newFilters);
        const newPagination = { ...pagination, page: 1 };
        setPagination(newPagination);
        debouncedOnFiltersChange(newFilters, newPagination);
    }, [filters, pagination, debouncedOnFiltersChange]);

    // Get active filters count
    const getActiveFiltersCount = useCallback(() => {
        return Object.keys(filters).filter(key => {
            const value = filters[key as keyof SearchFilters];
            return value !== undefined && value !== null && value !== '' && value !== 'all';
        }).length;
    }, [filters]);

    // Check if filters are active
    const hasActiveFilters = getActiveFiltersCount() > 0;

    // Build query string for API calls
    const buildQueryString = useCallback(() => {
        const params = new URLSearchParams();

        // Add filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                params.append(key, String(value));
            }
        });

        // Add pagination
        params.append('page', String(pagination.page));
        params.append('limit', String(pagination.limit));
        params.append('sortBy', pagination.sortBy);
        params.append('sortOrder', pagination.sortOrder);

        return params.toString();
    }, [filters, pagination]);

    // Get URL-friendly filter state
    const getUrlState = useCallback(() => {
        return {
            ...filters,
            page: pagination.page,
            limit: pagination.limit,
            sortBy: pagination.sortBy,
            sortOrder: pagination.sortOrder
        };
    }, [filters, pagination]);

    // Set state from URL parameters
    const setFromUrlParams = useCallback((params: URLSearchParams) => {
        const newFilters: SearchFilters = {};
        const newPagination: PaginationOptions = {
            page: 1,
            limit: 20,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        };

        // Extract filters
        const filterKeys: (keyof SearchFilters)[] = [
            'search', 'status', 'dateFrom', 'dateTo', 'lga', 'builderName',
            'policyNumber', 'surveyorRecommendation', 'brokerStatus', 'coverType',
            'priority'
        ];

        filterKeys.forEach(key => {
            const value = params.get(key);
            if (value && value !== 'all') {
                if (key === 'claimRequested' || key === 'overdue') {
                    newFilters[key] = value === 'true';
                } else if (key === 'minValue' || key === 'maxValue') {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                        newFilters[key] = numValue;
                    }
                } else {
                    newFilters[key] = value;
                }
            }
        });

        // Extract pagination
        const page = params.get('page');
        if (page) newPagination.page = parseInt(page) || 1;

        const limit = params.get('limit');
        if (limit) newPagination.limit = parseInt(limit) || 20;

        const sortBy = params.get('sortBy');
        if (sortBy) newPagination.sortBy = sortBy;

        const sortOrder = params.get('sortOrder');
        if (sortOrder === 'asc' || sortOrder === 'desc') {
            newPagination.sortOrder = sortOrder;
        }

        setFilters(newFilters);
        setPagination(newPagination);
    }, []);

    return {
        filters,
        pagination,
        isLoading,
        setIsLoading,
        updateFilters,
        updateFilter,
        updatePagination,
        clearFilters,
        clearFilter,
        hasActiveFilters,
        getActiveFiltersCount,
        buildQueryString,
        getUrlState,
        setFromUrlParams
    };
};