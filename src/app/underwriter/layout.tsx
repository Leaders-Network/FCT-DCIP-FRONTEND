'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthToken } from '@/utils/auth';
import UnderwriterAdminSidebar from '@/components/underwriter/UnderwriterSideBar';
import UnderwriterHeader from '@/components/underwriter/Underwriter';
import { NotificationProvider } from '@/context/NotificationContext';

export default function UnderwriterAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
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

    const isPublicAuthPage = [
        '/underwriter/login',
        '/underwriter/reset-password',
        '/underwriter/otp',
        '/underwriter/new-password',
        '/underwriter/registration-success'
    ].includes(pathname || '');

    useEffect(() => {
        // Skip auth check for public auth pages
        if (isPublicAuthPage) {
            return;
        }

        // Check if user is authenticated
        const token = getAuthToken('underwriter-admin');

        if (!token) {
            router.push('/underwriter/login');
        }
    }, [isPublicAuthPage, router]);

    // Public auth pages render without dashboard chrome
    if (isPublicAuthPage) {
        return <>{children}</>;
    }

    // Render with sidebar and header for authenticated pages
    return (
        <NotificationProvider>
            <div className="flex h-screen min-w-0 gap-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 p-0 sm:gap-3 sm:p-4 print:block print:h-auto print:bg-white print:p-0">
                {/* Mobile Overlay */}
                {isMobile && sidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden print:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <UnderwriterAdminSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isMobile={isMobile}
                />

                <div className="flex min-w-0 flex-1 flex-col overflow-visible print:block print:overflow-visible print:bg-white">
                    <UnderwriterHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="min-w-0 flex-1 overflow-y-auto rounded-none border border-white/70 bg-white/60 p-3 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:rounded-[2rem] sm:p-4 md:p-6 print:overflow-visible print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none">
                        {children}
                    </main>
                </div>
            </div>
        </NotificationProvider>
    );
}
