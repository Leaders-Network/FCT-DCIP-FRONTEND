"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import NIAAdminSidebar from '@/components/nia-admin/NIAAdminSidebar';
import NIAAdminHeader from '@/components/nia-admin/NIAAdminHeader';
import { useResponsiveSidebar } from '@/hooks/useResponsiveSidebar';

interface NIAAdminLayoutProps {
    children: React.ReactNode;
}

const NIAAdminLayout: React.FC<NIAAdminLayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const { isMobile, sidebarOpen, setSidebarOpen, toggleSidebar } = useResponsiveSidebar();

    // Don't show sidebar/header on login page
    const isLoginPage = pathname?.includes('/login');

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex h-screen overflow-hidden">
                {/* NIA Admin Sidebar */}
                <NIAAdminSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isMobile={isMobile}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* NIA Admin Header */}
                    <NIAAdminHeader onMenuClick={toggleSidebar} />

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-4 md:p-6">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default NIAAdminLayout;
