"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NIAAdminSidebar from '@/components/nia-admin/NIAAdminSidebar';
import NIAAdminHeader from '@/components/nia-admin/NIAAdminHeader';
import { NotificationProvider } from '@/context/NotificationContext';

interface NIAAdminLayoutProps {
    children: React.ReactNode;
}

const NIAAdminLayout: React.FC<NIAAdminLayoutProps> = ({ children }) => {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Handle responsive sidebar
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) {
                setSidebarOpen(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close sidebar on route change (mobile only)
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [pathname, isMobile]);

    // Don't show sidebar/header on public auth pages
    const isPublicAuthPage = [
        '/nia-admin/login',
        '/nia-admin/reset-password',
        '/nia-admin/otp',
        '/nia-admin/new-password',
        '/nia-admin/registration-success'
    ].includes(pathname || '');

    if (isPublicAuthPage) {
        return <>{children}</>;
    }

    return (
        <NotificationProvider>
            <div className="flex h-screen gap-3 bg-gradient-to-br from-slate-50 via-violet-50/30 to-cyan-50/20 p-3 sm:p-4 print:block print:h-auto print:bg-white print:p-0">
                {/* Mobile Overlay */}
                {isMobile && sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-20 md:hidden print:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* NIA Admin Sidebar */}
                <NIAAdminSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isMobile={isMobile}
                />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-visible print:block print:overflow-visible print:bg-white">
                    {/* NIA Admin Header */}
                    <NIAAdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto rounded-[2rem] border border-white/70 bg-white/60 p-3 sm:p-4 md:p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl print:overflow-visible print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none">
                        {children}
                    </main>
                </div>
            </div>
        </NotificationProvider>
    );
};

export default NIAAdminLayout;
