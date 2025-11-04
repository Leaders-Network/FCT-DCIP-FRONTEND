"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
    Home,
    Users,
    FileText,
    ClipboardList,
    Settings,
    LogOut,
    Building2,
    UserCheck,
    AlertTriangle,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

const NIAAdminSidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleLogout = () => {
        localStorage.removeItem("niaAdminToken");
        localStorage.removeItem("niaAdminInfo");
        localStorage.removeItem("organization");
        router.push("/nia-admin/login");
    };

    const menuItems = [
        {
            href: "/nia-admin/dashboard",
            label: "Dashboard",
            icon: Home,
            description: "Overview and statistics"
        },
        {
            href: "/nia-admin/surveyors",
            label: "NIA Surveyors",
            icon: Users,
            description: "Manage NIA surveyors"
        },
        {
            href: "/nia-admin/assignments",
            label: "Assignments",
            icon: ClipboardList,
            description: "Dual-surveyor assignments"
        },
        {
            href: "/nia-admin/user-inquiries",
            label: "User Inquiries",
            icon: AlertTriangle,
            description: "Handle user conflict inquiries"
        },
        {
            href: "/nia-admin/processing-monitor",
            label: "Processing Monitor",
            icon: FileText,
            description: "Monitor automatic report processing"
        },
        {
            href: "/nia-admin/administrators",
            label: "Administrators",
            icon: UserCheck,
            description: "Manage NIA administrators"
        },
        {
            href: "/nia-admin/settings",
            label: "Settings",
            icon: Settings,
            description: "Admin settings"
        },
    ];

    return (
        <aside
            className={`bg-white shadow-lg transition-all duration-300 flex flex-col border-r border-gray-200 ${isCollapsed ? "w-16" : "w-64"
                }`}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    {!isCollapsed ? (
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Building2 className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">NIA Portal</h2>
                                <p className="text-xs text-gray-500">Admin Dashboard</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-600 p-2 rounded-lg mx-auto">
                            <Building2 className="h-6 w-6 text-white" />
                        </div>
                    )}

                    <button
                        onClick={toggleSidebar}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                        ) : (
                            <ChevronLeft className="h-4 w-4 text-gray-500" />
                        )}
                    </button>
                </div>
            </div>

            {/* Organization Badge */}
            {!isCollapsed && (
                <div className="px-4 py-2 bg-blue-50 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-xs font-medium text-blue-700">
                            Nigerian Insurers Association
                        </span>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
                <div className="space-y-1 px-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center px-3 py-2 rounded-lg transition-colors group ${isActive
                                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    } ${isCollapsed ? "justify-center" : ""}`}
                                title={isCollapsed ? item.label : ""}
                            >
                                <Icon
                                    className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"} ${isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                                        }`}
                                />
                                {!isCollapsed && (
                                    <div className="flex-1">
                                        <div className="font-medium">{item.label}</div>
                                        <div className="text-xs text-gray-500 group-hover:text-gray-600">
                                            {item.description}
                                        </div>
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>

            {/* User Info & Logout */}
            <div className="border-t border-gray-200 p-4">
                {!isCollapsed && (
                    <div className="mb-3">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <UserCheck className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    NIA Administrator
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    {JSON.parse(localStorage.getItem('niaAdminInfo') || '{}').email || 'admin@nia.org'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className={`flex items-center w-full px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors ${isCollapsed ? "justify-center" : ""
                        }`}
                    title={isCollapsed ? "Logout" : ""}
                >
                    <LogOut className={`w-5 h-5 ${isCollapsed ? "" : "mr-3"}`} />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default NIAAdminSidebar;