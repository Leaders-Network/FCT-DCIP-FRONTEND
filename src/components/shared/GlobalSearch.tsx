'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp, FileText, Home, Shield, Users, MapPin, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';

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

            // TODO: Add API calls to search actual data
            // const apiResults = await searchAPI(searchQuery, userType);

            setResults(quickResults);
        } catch (error) {
            console.error('Search error:', error);
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
                    placeholder="Search... (⌘K)"
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
                                Found {results.length} result{results.length !== 1 ? 's' : ''}
                            </p>
                            {results.map((result, index) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleSelect(result)}
                                    className={`w-full flex items-start px-3 py-2 rounded-md text-left transition-colors ${index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex-shrink-0 mt-0.5">{result.icon}</div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                                        {result.subtitle && (
                                            <p className="text-xs text-gray-500 truncate">{result.subtitle}</p>
                                        )}
                                        {result.metadata && (
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {Object.entries(result.metadata).map(([key, value]) => (
                                                    <span key={key} className="text-xs text-gray-400">
                                                        {key}: {value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <span className="ml-2 text-xs text-gray-400 capitalize">{result.type}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {query && !loading && results.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            <Search className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-medium">No results found</p>
                            <p className="text-xs mt-1">Try searching for something else</p>
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
                title: 'My Properties',
                subtitle: 'View and manage properties',
                url: '/dashboard/property',
                icon: <MapPin className="h-5 w-5 text-green-600" />
            },
            {
                title: 'My Policies',
                subtitle: 'View insurance policies',
                url: '/dashboard/insurance',
                icon: <FileText className="h-5 w-5 text-purple-600" />
            },
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
        if ('property'.includes(lowerQuery) || 'properties'.includes(lowerQuery)) {
            results.push({
                id: 'nav-property',
                title: 'My Properties',
                subtitle: 'View and manage your properties',
                type: 'page',
                url: '/dashboard/property',
                icon: <MapPin className="h-5 w-5 text-green-600" />
            });
        }
        if ('policy'.includes(lowerQuery) || 'policies'.includes(lowerQuery)) {
            results.push({
                id: 'nav-policies',
                title: 'My Policies',
                subtitle: 'View your insurance policies',
                type: 'page',
                url: '/dashboard/insurance',
                icon: <FileText className="h-5 w-5 text-purple-600" />
            });
        }
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
