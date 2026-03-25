"use client";
import React, { useState, useEffect } from "react";
import { Bell, Search, User, Settings, LogOut, Building2, RefreshCw, Menu } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { brokerAdminAPI } from "@/services/api";
import { getAuthToken, removeAuthToken } from "@/utils/auth";

interface Notification {
    _id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    actionUrl?: string;
}

interface BrokerHeaderProps {
    onMenuClick?: () => void;
}

const BrokerHeader: React.FC<BrokerHeaderProps> = ({ onMenuClick }) => {
    const [adminInfo, setAdminInfo] = useState<{
        fullname: string;
        email: string;
        organization: string;
        brokerFirmName?: string;
        firstname?: string;
        lastname?: string;
    } | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationCount, setNotificationCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        // Get admin info from localStorage
        const storedAdminInfo = localStorage.getItem("brokerAdminInfo");
        if (storedAdminInfo) {
            setAdminInfo(JSON.parse(storedAdminInfo));
        }

        fetchNotifications();
    }, []);

    const getDashboardToken = (): string | null => {
        return getAuthToken('broker-admin') || localStorage.getItem('brokerAdminToken') || localStorage.getItem('token');
    };

    const fetchNotifications = async () => {
        try {
            const token = getDashboardToken();
            if (!token) {
                setNotifications([]);
                setNotificationCount(0);
                return;
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${baseUrl}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const list = data.data?.notifications || data.notifications || [];
                const unread = data.data?.unreadCount || data.unreadCount || 0;
                setNotifications(list);
                setNotificationCount(unread);
            } else {
                setNotifications([]);
                setNotificationCount(0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            setNotifications([]);
            setNotificationCount(0);
        }
    };

    const handleNotificationClick = async (notificationId: string, actionUrl?: string) => {
        try {
            const token = getDashboardToken();
            if (!token) return;

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            await fetch(`${baseUrl}/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (actionUrl) {
                window.location.href = actionUrl;
            }
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = getDashboardToken();
            if (!token) return;

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            await fetch(`${baseUrl}/notifications/mark-all-read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement search functionality
        console.log("Searching for:", searchQuery);
    };

    const adminName =
        adminInfo?.fullname ||
        [adminInfo?.firstname, adminInfo?.lastname].filter(Boolean).join(" ").trim() ||
        "Broker Admin";

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
                            <h1 className="text-base sm:text-lg font-semibold text-gray-900">Broker Admin Portal</h1>
                            <p className="text-xs text-gray-500">Faith Broker Firm</p>
                        </div>
                    </div>
                </div>

                {/* Right side - Search, notifications, and user menu */}
                <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Search - hidden on mobile */}
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

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowNotifications(!showNotifications);
                                if (!showNotifications) {
                                    fetchNotifications();
                                }
                            }}
                            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative"
                        >
                            <Bell className="h-5 w-5" />
                            {notificationCount > 0 && (
                                <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowNotifications(false)}
                                />
                                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-[500px] overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                                        {notificationCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="text-xs text-blue-600 hover:text-blue-800"
                                            >
                                                Mark all as read
                                            </button>
                                        )}
                                    </div>
                                    <div className="overflow-y-auto flex-1">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center text-gray-500">
                                                <Bell className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                                <p>No notifications</p>
                                            </div>
                                        ) : (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification._id}
                                                    onClick={() => handleNotificationClick(notification._id, notification.actionUrl)}
                                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                                                >
                                                    <div className="flex items-start">
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                {notification.message}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {new Date(notification.createdAt).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        {!notification.read && (
                                                            <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="hidden lg:block text-right">
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[100px]">John Doe</p>
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

                                <DropdownMenuItem onSelect={() => window.location.href = '/broker-admin/settings'}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem onSelect={() => window.location.href = '/broker-admin/settings'}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuItem
                                    className="text-red-600"
                                    onSelect={async () => {
                                        try {
                                            await brokerAdminAPI.logout();
                                        } catch (error) {
                                            console.error("Broker admin logout failed:", error);
                                        } finally {
                                            removeAuthToken('broker-admin');
                                            localStorage.removeItem('brokerAdminInfo');
                                            window.location.href = '/broker-admin/login';
                                        }
                                    }}
                                >
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
