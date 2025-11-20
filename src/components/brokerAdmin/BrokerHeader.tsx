"use client";
import React, { useState, useEffect } from "react";
import { Bell, Search, User, Settings, LogOut, Building2, RefreshCw } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const BrokerHeader = () => {
    const [adminInfo, setAdminInfo] = useState<{
        fullname: string;
        email: string;
        organization: string;
        brokerFirmName?: string;
    } | null>(null);
    const [notifications, setNotifications] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        // Get admin info from localStorage
        const storedAdminInfo = localStorage.getItem("niaAdminInfo");
        if (storedAdminInfo) {
            setAdminInfo(JSON.parse(storedAdminInfo));
        }

        // TODO: Fetch notifications count
        setNotifications(3); // Mock data
    }, []);



    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement search functionality
        console.log("Searching for:", searchQuery);
    };

    const adminName = adminInfo?.name || adminInfo?.firstname
        ? `${adminInfo.firstname} ${adminInfo.lastname}`
        : "Broker Admin";

    const initials = adminName
        .split(" ")
        .map((word: string) => word[0])
        .join("")
        .toUpperCase();

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left side - Organization info */}
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Broker Admin Portal</h1>
                            <p className="text-xs text-gray-500">Faith Broker Firm</p>
                        </div>
                    </div>
                </div>

                {/* Right side - Search, notifications, and user menu */}
                <div className="flex items-center space-x-4">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="relative hidden md:block">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search assignments, surveyors..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </form>

                    {/* Refresh Button */}
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                        title="Refresh Dashboard"
                    >
                        <RefreshCw className="h-5 w-5" />
                    </button>

                    {/* Notifications */}
                    <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
                        <Bell className="h-5 w-5" />
                        {notifications > 0 && (
                            <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                                {notifications > 9 ? '9+' : notifications}
                            </span>
                        )}
                    </button>

                    {/* User Menu */}
                    <div className="flex items-center space-x-3">
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-gray-900">John Doe</p>
                            <p className="text-xs text-gray-500">Administrator</p>
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
                                    <p className="text-xs text-gray-500">{adminInfo?.email || 'admin@broker.org'}</p>
                                    <div className="flex items-center mt-1">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                        <span className="text-xs text-blue-600 font-medium">Faith Trust Firm</span>
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

                                <DropdownMenuItem className="text-red-600">
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
        </header>
    );
};

export default BrokerHeader;