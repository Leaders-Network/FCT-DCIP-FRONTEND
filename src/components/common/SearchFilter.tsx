'use client';

import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    X,
    Calendar,
    ChevronDown,
    RotateCcw,
    SlidersHorizontal
} from 'lucide-react';
import { SearchFilters, FilterOptions } from '@/hooks/useSearchFilter';

interface SearchFilterProps {
    filters: SearchFilters;
    onFiltersChange: (filters: Partial<SearchFilters>) => void;
    onClearFilters: () => void;
    filterOptions?: FilterOptions;
    placeholder?: string;
    showAdvancedFilters?: boolean;
    availableFilters?: (keyof SearchFilters)[];
    className?: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
    filters,
    onFiltersChange,
    onClearFilters,
    filterOptions,
    placeholder = "Search policies, builders, or policy numbers...",
    showAdvancedFilters = true,
    availableFilters = ['search', 'status', 'dateFrom', 'dateTo', 'lga'],
    className = ""
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [searchValue, setSearchValue] = useState(filters.search || '');

    // Update local search value when filters change
    useEffect(() => {
        setSearchValue(filters.search || '');
    }, [filters.search]);

    // Handle search input with debouncing
    const handleSearchChange = (value: string) => {
        setSearchValue(value);
        // Debounce search - will be handled by the parent hook
        onFiltersChange({ search: value || undefined });
    };

    // Handle filter change
    const handleFilterChange = (key: keyof SearchFilters, value: any) => {
        onFiltersChange({ [key]: value === '' || value === 'all' ? undefined : value });
    };

    // Get active filters count
    const getActiveFiltersCount = () => {
        return Object.keys(filters).filter(key => {
            const value = filters[key as keyof SearchFilters];
            return value !== undefined && value !== null && value !== '' && value !== 'all';
        }).length;
    };

    const activeFiltersCount = getActiveFiltersCount();

    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-4 space-y-4 ${className}`}>
            {/* Search Bar */}
            <div className="flex gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {searchValue && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {showAdvancedFilters && (
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${showAdvanced || activeFiltersCount > 0
                                ? 'border-blue-300 text-blue-700 bg-blue-50'
                                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                            }`}
                    >
                        <SlidersHorizontal className="w-4 h-4 mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                                {activeFiltersCount}
                            </span>
                        )}
                        <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                    </button>
                )}

                {activeFiltersCount > 0 && (
                    <button
                        onClick={onClearFilters}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Clear
                    </button>
                )}
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                        {/* Status Filter */}
                        {availableFilters.includes('status') && filterOptions?.statuses && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={filters.status || 'all'}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Statuses</option>
                                    {filterOptions.statuses.map(status => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* LGA Filter */}
                        {availableFilters.includes('lga') && filterOptions?.lgas && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    LGA
                                </label>
                                <select
                                    value={filters.lga || 'all'}
                                    onChange={(e) => handleFilterChange('lga', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All LGAs</option>
                                    {filterOptions.lgas.map(lga => (
                                        <option key={lga} value={lga}>
                                            {lga.toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Priority Filter */}
                        {availableFilters.includes('priority') && filterOptions?.priorities && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Priority
                                </label>
                                <select
                                    value={filters.priority || 'all'}
                                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Priorities</option>
                                    {filterOptions.priorities.map(priority => (
                                        <option key={priority} value={priority}>
                                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Cover Type Filter */}
                        {availableFilters.includes('coverType') && filterOptions?.coverTypes && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cover Type
                                </label>
                                <select
                                    value={filters.coverType || 'all'}
                                    onChange={(e) => handleFilterChange('coverType', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Cover Types</option>
                                    {filterOptions.coverTypes.map(type => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Surveyor Recommendation Filter */}
                        {availableFilters.includes('surveyorRecommendation') && filterOptions?.surveyorRecommendations && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Surveyor Recommendation
                                </label>
                                <select
                                    value={filters.surveyorRecommendation || 'all'}
                                    onChange={(e) => handleFilterChange('surveyorRecommendation', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Recommendations</option>
                                    {filterOptions.surveyorRecommendations.map(rec => (
                                        <option key={rec} value={rec}>
                                            {rec.charAt(0).toUpperCase() + rec.slice(1).replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Broker Status Filter */}
                        {availableFilters.includes('brokerStatus') && filterOptions?.brokerStatuses && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Claim Status
                                </label>
                                <select
                                    value={filters.brokerStatus || 'all'}
                                    onChange={(e) => handleFilterChange('brokerStatus', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Claim Statuses</option>
                                    {filterOptions.brokerStatuses.map(status => (
                                        <option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Date From Filter */}
                        {availableFilters.includes('dateFrom') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date From
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="date"
                                        value={filters.dateFrom || ''}
                                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Date To Filter */}
                        {availableFilters.includes('dateTo') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date To
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="date"
                                        value={filters.dateTo || ''}
                                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Contractor Name Filter */}
                        {availableFilters.includes('builderName') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contractor Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter contractor name"
                                    value={filters.builderName || ''}
                                    onChange={(e) => handleFilterChange('builderName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        )}

                        {/* Policy Number Filter */}
                        {availableFilters.includes('policyNumber') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Policy Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter policy number"
                                    value={filters.policyNumber || ''}
                                    onChange={(e) => handleFilterChange('policyNumber', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        )}

                        {/* Min Value Filter */}
                        {availableFilters.includes('minValue') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Min Value (₦)
                                </label>
                                <input
                                    type="number"
                                    placeholder="0"
                                    value={filters.minValue || ''}
                                    onChange={(e) => handleFilterChange('minValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        )}

                        {/* Max Value Filter */}
                        {availableFilters.includes('maxValue') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Max Value (₦)
                                </label>
                                <input
                                    type="number"
                                    placeholder="1000000000"
                                    value={filters.maxValue || ''}
                                    onChange={(e) => handleFilterChange('maxValue', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        )}

                        {/* Claims Requested Filter */}
                        {availableFilters.includes('claimRequested') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Claims
                                </label>
                                <select
                                    value={filters.claimRequested === undefined ? 'all' : filters.claimRequested ? 'true' : 'false'}
                                    onChange={(e) => handleFilterChange('claimRequested', e.target.value === 'all' ? undefined : e.target.value === 'true')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Policies</option>
                                    <option value="true">With Claims</option>
                                    <option value="false">Without Claims</option>
                                </select>
                            </div>
                        )}

                        {/* Overdue Filter */}
                        {availableFilters.includes('overdue') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Overdue
                                </label>
                                <select
                                    value={filters.overdue === undefined ? 'all' : filters.overdue ? 'true' : 'false'}
                                    onChange={(e) => handleFilterChange('overdue', e.target.value === 'all' ? undefined : e.target.value === 'true')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Assignments</option>
                                    <option value="true">Overdue Only</option>
                                    <option value="false">Not Overdue</option>
                                </select>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
                <div className="border-t border-gray-200 pt-3">
                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-500">Active filters:</span>
                        {Object.entries(filters).map(([key, value]) => {
                            if (value === undefined || value === null || value === '' || value === 'all') return null;

                            return (
                                <span
                                    key={key}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                    {key}: {String(value)}
                                    <button
                                        onClick={() => handleFilterChange(key as keyof SearchFilters, undefined)}
                                        className="ml-1 text-blue-600 hover:text-blue-800"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};