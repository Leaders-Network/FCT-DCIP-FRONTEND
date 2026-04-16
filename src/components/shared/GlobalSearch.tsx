'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, FileText, Home, Shield, Users, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { builderLiabilityPolicyAPI } from '@/services/builderLiabilityPolicyApi';
import { adminApi } from '@/services/api';

interface SearchResult {
    id: string;
    title: string;
    subtitle?: string;
    type: 'policy' | 'property' | 'insurance' | 'surveyor' | 'user' | 'assignment' | 'page';
    url: string;
    icon: React.ReactNode;
    metadata?: Record<string, string>;
}

interface GlobalSearchProps {
    userType: 'user' | 'admin' | 'surveyor' | 'nia-admin' | 'broker-admin';
    className?: string;
}

// API search function
async function searchAPI(searchQuery: string, userType: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const lowerQuery = searchQuery.toLowerCase();

    try {
        if (userType === 'admin' || userType === 'nia-admin') {
            // Search Builder Liability Policies
            try {
                const policiesResponse = await builderLiabilityPolicyAPI.searchPolicies(searchQuery, 5);
                if (policiesResponse.success && policiesResponse.data.policies) {
                    policiesResponse.data.policies.forEach(policy => {
                        results.push({
                            id: `policy-${policy._id}`,
                            title: `Policy: ${policy.builder?.nameOfBuilder || 'Unknown Builder'}`,
                            subtitle: `Status: ${policy.status} | RC: ${policy.builder?.rcNumber || 'N/A'}`,
                            type: 'policy',
                            url: userType === 'admin' ? `/admin/dashboard/policies/${policy._id}` : `/nia-admin/dashboard/policies/${policy._id}`,
                            icon: <FileText className="h-5 w-5 text-purple-600" />,
                            metadata: {
                                'Policy Number': policy.policyNumber || 'N/A',
                                'Project Value': `₦${policy.project?.totalEstimateSum?.toLocaleString() || '0'}`
                            }
                        });
                    });
                }
            } catch (error) {
            }

            // Search Surveyors
            try {
                const surveyorsResponse = await adminApi.getSurveyors();
                if (surveyorsResponse.success && surveyorsResponse.data) {
                    const filteredSurveyors = surveyorsResponse.data.filter((surveyor: any) => {
                        const fullName = `${surveyor.firstname || ''} ${surveyor.lastname || ''}`.toLowerCase();
                        const email = (surveyor.email || '').toLowerCase();
                        const phone = (surveyor.phonenumber || '').toLowerCase();
                        return fullName.includes(lowerQuery) ||
                            email.includes(lowerQuery) ||
                            phone.includes(lowerQuery);
                    }).slice(0, 3);

                    filteredSurveyors.forEach((surveyor: any) => {
                        results.push({
                            id: `surveyor-${surveyor._id}`,
                            title: `${surveyor.firstname || ''} ${surveyor.lastname || ''}`.trim(),
                            subtitle: `Surveyor | ${surveyor.email || 'No email'}`,
                            type: 'surveyor',
                            url: userType === 'admin' ? `/admin/dashboard/surveyors/${surveyor._id}` : `/nia-admin/surveyors/${surveyor._id}`,
                            icon: <Users className="h-5 w-5 text-blue-600" />,
                            metadata: {
                                'Phone': surveyor.phonenumber || 'N/A',
                                'Status': surveyor.status || 'Unknown'
                            }
                        });
                    });
                }
            } catch (error) {
            }

            // Search Assignments
            try {
                const assignmentsResponse = await adminApi.getAssignments({ limit: 50 });
                if (assignmentsResponse.success && assignmentsResponse.data) {
                    const filteredAssignments = assignmentsResponse.data
                        .filter((assignment: any) => {
                            const builderName = (assignment.policyId?.builder?.nameOfBuilder || '').toLowerCase();
                            const status = (assignment.status || '').toLowerCase();
                            const surveyorName = `${assignment.surveyorId?.firstname || ''} ${assignment.surveyorId?.lastname || ''}`.toLowerCase();
                            return builderName.includes(lowerQuery) || status.includes(lowerQuery) || surveyorName.includes(lowerQuery);
                        })
                        .slice(0, 3);

                    filteredAssignments.forEach((assignment: any) => {
                        const policyInfo = assignment.policyId;
                        const surveyorInfo = assignment.surveyorId;
                        results.push({
                            id: `assignment-${assignment._id}`,
                            title: `Assignment: ${policyInfo?.builder?.nameOfBuilder || 'Unknown Builder'}`,
                            subtitle: `Surveyor: ${surveyorInfo?.firstname || ''} ${surveyorInfo?.lastname || ''} | Status: ${assignment.status}`,
                            type: 'assignment',
                            url: userType === 'admin' ? `/admin/dashboard/assignments/${assignment._id}` : `/nia-admin/assignments/${assignment._id}`,
                            icon: <Calendar className="h-5 w-5 text-green-600" />,
                            metadata: {
                                'Priority': assignment.priority || 'Medium',
                                'Deadline': assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'N/A'
                            }
                        });
                    });
                }
            } catch (error) {
            }

            // Search Administrators (if applicable)
            if (lowerQuery.includes('admin') || lowerQuery.includes('staff') || lowerQuery.includes('employee')) {
                try {
                    const employeesResponse = await adminApi.getEmployees();
                    const employees = employeesResponse?.allStaff?.sanitizedEmployees || employeesResponse?.data || [];
                    if (Array.isArray(employees) && employees.length > 0) {
                        const filteredEmployees = employees.filter((employee: any) => {
                            const fullName = `${employee.firstname || ''} ${employee.lastname || ''}`.toLowerCase();
                            const email = (employee.email || '').toLowerCase();
                            const role = (employee.employeeRole?.role || '').toLowerCase();
                            return fullName.includes(lowerQuery) ||
                                email.includes(lowerQuery) ||
                                role.includes(lowerQuery);
                        }).slice(0, 3);

                        filteredEmployees.forEach((employee: any) => {
                            results.push({
                                id: `employee-${employee._id}`,
                                title: `${employee.firstname || ''} ${employee.lastname || ''}`.trim(),
                                subtitle: `${employee.employeeRole?.role || 'Staff'} | ${employee.email || 'No email'}`,
                                type: 'user',
                                url: userType === 'admin' ? `/admin/dashboard/administrators/${employee._id}` : `/nia-admin/administrators/${employee._id}`,
                                icon: <Users className="h-5 w-5 text-indigo-600" />,
                                metadata: {
                                    'Phone': employee.phonenumber || 'N/A',
                                    'Status': employee.employeeStatus?.status || 'Unknown'
                                }
                            });
                        });
                    }
                } catch (error) {
                }
            }
        }

        // For user searches, we could add user-specific searches here
        if (userType === 'user') {
            // Search user's own policies
            try {
                const userPoliciesResponse = await builderLiabilityPolicyAPI.searchPolicies(searchQuery, 3);
                if (userPoliciesResponse.success && userPoliciesResponse.data.policies) {
                    userPoliciesResponse.data.policies.forEach(policy => {
                        results.push({
                            id: `user-policy-${policy._id}`,
                            title: `My Policy: ${policy.builder?.nameOfBuilder || 'Builder Liability'}`,
                            subtitle: `Status: ${policy.status} | ${policy.project?.coverTypeIdxDetails || 'Builder Liability'}`,
                            type: 'policy',
                            url: `/dashboard/insurance/${policy._id}`,
                            icon: <Shield className="h-5 w-5 text-green-600" />,
                            metadata: {
                                'Policy Number': policy.policyNumber || 'N/A',
                                'Project Value': `₦${policy.project?.totalEstimateSum?.toLocaleString() || '0'}`
                            }
                        });
                    });
                }
            } catch (error) {
            }
        }
    } catch (error) {
    }

    return results;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ userType, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const debouncedQuery = useDebounce(query, 300);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(`recentSearches_${userType}`);
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, [userType]);

    // Save recent search
    const saveRecentSearch = useCallback((searchQuery: string) => {
        if (!searchQuery.trim()) return;

        const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem(`recentSearches_${userType}`, JSON.stringify(updated));
    }, [recentSearches, userType]);

    // Clear recent searches
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem(`recentSearches_${userType}`);
    };

    // Keyboard shortcut (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
                setQuery('');
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    // Search function
    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            // Get quick navigation results
            const quickResults = getQuickNavigationResults(searchQuery, userType);

            // Add API calls to search actual data
            const apiResults = await searchAPI(searchQuery, userType);

            // Combine quick navigation and API results
            const combinedResults = [...quickResults, ...apiResults];

            // Limit total results to prevent overwhelming the UI
            const limitedResults = combinedResults.slice(0, 10);
            setResults(limitedResults);
        } catch (error) {
            // Fallback to just quick results if API fails
            const quickResults = getQuickNavigationResults(searchQuery, userType);
            setResults(quickResults);
        } finally {
            setLoading(false);
        }
    }, [userType]);

    // Perform search when debounced query changes
    useEffect(() => {
        if (debouncedQuery) {
            performSearch(debouncedQuery);
        } else {
            setResults([]);
        }
    }, [debouncedQuery, performSearch]);

    // Handle result selection
    const handleSelect = (result: SearchResult) => {
        saveRecentSearch(query);
        router.push(result.url);
        setIsOpen(false);
        setQuery('');
    };

    // Handle recent search click
    const handleRecentSearchClick = (search: string) => {
        setQuery(search);
        performSearch(search);
    };

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            e.preventDefault();
            handleSelect(results[selectedIndex]);
        }
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        userType === 'admin' || userType === 'nia-admin'
                            ? "Search policies, surveyors, assignments... (⌘K)"
                            : "Search... (⌘K)"
                    }
                    className="pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {query && (
                    <button
                        onClick={() => setQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[500px] overflow-y-auto z-50">
                    {/* Loading State */}
                    {loading && (
                        <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-sm mt-2">Searching...</p>
                        </div>
                    )}

                    {/* No Query - Show Recent Searches and Quick Links */}
                    {!query && !loading && (
                        <div className="p-3">
                            {recentSearches.length > 0 && (
                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2 px-2">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase">Recent Searches</h3>
                                        <button
                                            onClick={clearRecentSearches}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    {recentSearches.map((search, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleRecentSearchClick(search)}
                                            className="w-full flex items-center px-3 py-2 hover:bg-gray-50 rounded-md text-left"
                                        >
                                            <Clock className="h-4 w-4 text-gray-400 mr-3" />
                                            <span className="text-sm text-gray-700">{search}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div>
                                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Quick Navigation</h3>
                                {getQuickLinks(userType).map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => {
                                            router.push(link.url);
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center px-3 py-2 hover:bg-gray-50 rounded-md text-left"
                                    >
                                        {link.icon}
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{link.title}</p>
                                            <p className="text-xs text-gray-500">{link.subtitle}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search Results */}
                    {query && !loading && results.length > 0 && (
                        <div className="p-2">
                            <p className="text-xs text-gray-500 px-3 py-2">
                                Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                                {results.length === 10 && <span className="text-blue-600"> (showing first 10)</span>}
                            </p>
                            {results.map((result, index) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleSelect(result)}
                                    className={`w-full flex items-start px-3 py-3 rounded-md text-left transition-colors ${index === selectedIndex ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">{result.icon}</div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                                        {result.subtitle && (
                                            <p className="text-xs text-gray-500 truncate mt-0.5">{result.subtitle}</p>
                                        )}
                                        {result.metadata && (
                                            <div className="flex flex-wrap gap-3 mt-1">
                                                {Object.entries(result.metadata).map(([key, value]) => (
                                                    <span key={key} className="text-xs text-gray-400">
                                                        <span className="font-medium">{key}:</span> {value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-2 flex flex-col items-end">
                                        <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                                            {result.type}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {query && !loading && results.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">No results found for "{query}"</p>
                            <p className="text-xs mt-1">
                                {userType === 'admin' || userType === 'nia-admin'
                                    ? 'Try searching for policy numbers, builder names, surveyor names, or email addresses'
                                    : 'Try searching for your policies or insurance options'
                                }
                            </p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
                        <span>Press ⌘K to search anytime</span>
                        <span>↑↓ to navigate, ↵ to select</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function to get quick navigation links based on user type
function getQuickLinks(userType: string) {
    const commonLinks = [
        {
            title: 'Dashboard',
            subtitle: 'Go to main dashboard',
            url: userType === 'admin' ? '/admin/dashboard' : '/dashboard',
            icon: <Home className="h-5 w-5 text-blue-600" />
        }
    ];

    if (userType === 'user') {
        return [
            ...commonLinks,
            {
                title: 'Insurance Options',
                subtitle: 'Browse insurance types',
                url: '/dashboard/insurance',
                icon: <Shield className="h-5 w-5 text-orange-600" />
            }
        ];
    }

    if (userType === 'admin') {
        return [
            ...commonLinks,
            {
                title: 'Policies',
                subtitle: 'Manage policy requests',
                url: '/admin/dashboard/policies',
                icon: <FileText className="h-5 w-5 text-purple-600" />
            },
            {
                title: 'Surveyors',
                subtitle: 'Manage surveyors',
                url: '/admin/dashboard/surveyors',
                icon: <Users className="h-5 w-5 text-blue-600" />
            },
            {
                title: 'Assignments',
                subtitle: 'View assignments',
                url: '/admin/dashboard/assignments',
                icon: <Calendar className="h-5 w-5 text-green-600" />
            }
        ];
    }

    return commonLinks;
}

// Helper function to get quick navigation results based on search query
function getQuickNavigationResults(query: string, userType: string): SearchResult[] {
    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // User-specific searches
    if (userType === 'user') {
        if ('insurance'.includes(lowerQuery)) {
            results.push({
                id: 'nav-insurance',
                title: 'Insurance Options',
                subtitle: 'Browse available insurance types',
                type: 'page',
                url: '/dashboard/insurance',
                icon: <Shield className="h-5 w-5 text-orange-600" />
            });
        }
    }

    // Admin-specific searches
    if (userType === 'admin') {
        if ('policy'.includes(lowerQuery) || 'policies'.includes(lowerQuery)) {
            results.push({
                id: 'nav-policies',
                title: 'Policy Management',
                subtitle: 'Manage all policy requests',
                type: 'page',
                url: '/admin/dashboard/policies',
                icon: <FileText className="h-5 w-5 text-purple-600" />
            });
        }
        if ('surveyor'.includes(lowerQuery) || 'surveyors'.includes(lowerQuery)) {
            results.push({
                id: 'nav-surveyors',
                title: 'Surveyor Management',
                subtitle: 'Manage surveyors',
                type: 'page',
                url: '/admin/dashboard/surveyors',
                icon: <Users className="h-5 w-5 text-blue-600" />
            });
        }
        if ('assignment'.includes(lowerQuery) || 'assignments'.includes(lowerQuery)) {
            results.push({
                id: 'nav-assignments',
                title: 'Assignment Management',
                subtitle: 'View and manage assignments',
                type: 'page',
                url: '/admin/dashboard/assignments',
                icon: <Calendar className="h-5 w-5 text-green-600" />
            });
        }
        if ('user'.includes(lowerQuery) || 'users'.includes(lowerQuery)) {
            results.push({
                id: 'nav-users',
                title: 'User Management',
                subtitle: 'Manage platform users',
                type: 'page',
                url: '/admin/dashboard/users',
                icon: <Users className="h-5 w-5 text-indigo-600" />
            });
        }
    }

    // Common searches
    if ('dashboard'.includes(lowerQuery)) {
        results.push({
            id: 'nav-dashboard',
            title: 'Dashboard',
            subtitle: 'Go to main dashboard',
            type: 'page',
            url: userType === 'admin' ? '/admin/dashboard' : '/dashboard',
            icon: <Home className="h-5 w-5 text-blue-600" />
        });
    }

    return results;
}

export default GlobalSearch;
