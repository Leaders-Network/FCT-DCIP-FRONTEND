"use client";
import React, { useState, useEffect } from "react";
import { Search, User, Settings, LogOut, Building2, RefreshCw, Menu } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Assignment, Surveyor, PolicyRequest } from "@/types/api.types";
import { clearAuthTokens, decodeToken, getAuthToken } from "@/utils/auth";
import NotificationBell from "@/components/shared/NotificationBell";

interface SearchResult {
    _id: string;
    type: 'assignment' | 'surveyor' | 'policy';
    firstname?: string;
    lastname?: string;
    email?: string;
    location?: {
        address: string;
    };
    propertyDetails?: {
        address: string;
    };
}

interface NIAAdminHeaderProps {
    onMenuClick?: () => void;
}

const NIAAdminHeader: React.FC<NIAAdminHeaderProps> = ({ onMenuClick }) => {
    const [adminInfo, setAdminInfo] = useState<{
        fullname: string;
        email: string;
        organization: string;
    } | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

    const getDashboardToken = (): string | null => {
        return getAuthToken('nia-admin');
    };

    useEffect(() => {
        // Get admin info from localStorage
        const storedAdminInfo = localStorage.getItem("niaAdminInfo");
        if (storedAdminInfo) {
            setAdminInfo(JSON.parse(storedAdminInfo));
        } else {
            const decoded = decodeToken(getDashboardToken() || undefined) as { fullname?: string } | null;
            if (decoded?.fullname) {
                setAdminInfo({
                    fullname: decoded.fullname,
                    email: '',
                    organization: 'AMMC'
                });
            }
        }
    }, []);

    const handleLogout = () => {
        clearAuthTokens();
        localStorage.removeItem("niaAdminToken");
        localStorage.removeItem("niaAdminInfo");
        localStorage.removeItem("organization");
        window.location.href = "/nia-admin/login";
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        try {
            const token = getDashboardToken();
            if (!token) {
                return;
            }

            // Search across multiple resources
            const [assignmentsRes, surveyorsRes, policiesRes] = await Promise.all([
                fetch(`/api/nia-admin/assignments?search=${searchQuery}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`/api/nia-admin/surveyors?search=${searchQuery}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`/api/nia-admin/policies?search=${searchQuery}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const results = [];

            if (assignmentsRes.ok) {
                const data = await assignmentsRes.json();
                results.push(...(data.data || []).map((item: Assignment) => ({ ...item, type: 'assignment' as const })));
            }

            if (surveyorsRes.ok) {
                const data = await surveyorsRes.json();
                results.push(...(data.data || []).map((item: Surveyor) => ({ ...item, type: 'surveyor' as const })));
            }

            if (policiesRes.ok) {
                const data = await policiesRes.json();
                results.push(...(data.data || []).map((item: PolicyRequest) => ({ ...item, type: 'policy' as const })));
            }

            setSearchResults(results);
            setShowSearchResults(true);
        } catch (error) {
        }
    };

    const adminName = adminInfo?.fullname || "NIA Admin";

    const initials = adminName
        .split(" ")
        .map((word: string) => word[0])
        .join("")
        .toUpperCase();

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between">
                {/* Left side - Menu button and Organization info */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Mobile menu button */}
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg">
                            <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-base sm:text-lg font-semibold text-gray-900">NIA Admin Portal</h1>
                            <p className="text-xs text-gray-500">Nigerian Insurers Association</p>
                        </div>
                    </div>
                </div>

                {/* Right side - Search, notifications, and user menu */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Search - hidden on mobile, shown in separate row */}
                    <form onSubmit={handleSearch} className="relative hidden lg:block">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-48 xl:w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </form>

                    {/* Refresh Button - hidden on small screens */}
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors hidden sm:block"
                        title="Refresh Dashboard"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>

                    <NotificationBell />

                    {/* User Menu */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="hidden lg:block text-right">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{adminName}</p>
                            <p className="text-xs text-gray-500">NIA Administrator</p>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                    {initials}
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <div className="px-3 py-2 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">{adminName}</p>
                                    <p className="text-xs text-gray-500">{adminInfo?.email || 'admin@nia.org'}</p>
                                    <div className="flex items-center mt-1">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                        <span className="text-xs text-blue-600 font-medium">Nigerian Insurers Association</span>
                                    </div>
                                </div>

                                <DropdownMenuItem onSelect={() => window.location.href = '/nia-admin/profile'}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem onSelect={() => window.location.href = '/nia-admin/settings'}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem onSelect={handleLogout} className="text-red-600">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Mobile Search */}
            <div className="mt-4 md:hidden">
                <form onSubmit={handleSearch} className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search assignments, surveyors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                </form>
            </div>

            {/* Search Results Modal */}
            {showSearchResults && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setShowSearchResults(false)}
                    />
                    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white rounded-lg shadow-xl z-50 max-h-[600px] overflow-hidden flex flex-col mx-4">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Search Results for "{searchQuery}"
                            </h3>
                            <button
                                onClick={() => setShowSearchResults(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 p-4">
                            {searchResults.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Search className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                    <p>No results found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {searchResults.map((result, index) => (
                                        <div
                                            key={index}
                                            onClick={() => {
                                                const url = result.type === 'assignment'
                                                    ? `/nia-admin/assignments/${result._id}`
                                                    : result.type === 'surveyor'
                                                        ? `/nia-admin/surveyors`
                                                        : `/nia-admin/dashboard/policies/${result._id}`;
                                                window.location.href = url;
                                            }}
                                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${result.type === 'assignment' ? 'bg-blue-100 text-blue-800' :
                                                            result.type === 'surveyor' ? 'bg-green-100 text-green-800' :
                                                                'bg-purple-100 text-purple-800'
                                                            }`}>
                                                            {result.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {result.type === 'assignment'
                                                            ? `Assignment ${result._id?.substring(0, 8)}`
                                                            : result.type === 'surveyor'
                                                                ? `${result.firstname} ${result.lastname}`
                                                                : `Policy ${result._id?.substring(0, 8)}`
                                                        }
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {result.type === 'assignment' && result.location?.address}
                                                        {result.type === 'surveyor' && result.email}
                                                        {result.type === 'policy' && result.propertyDetails?.address}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </header>
    );
};

export default NIAAdminHeader;
