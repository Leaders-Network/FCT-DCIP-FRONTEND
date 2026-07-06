'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthToken } from '@/utils/auth';
import BrokerAdminSidebar from '@/components/brokerAdmin/BrokerAdminSideBar';
import BrokerHeader from '@/components/brokerAdmin/BrokerHeader';
import { NotificationProvider } from '@/context/NotificationContext';

export default function BrokerAdminLayout({
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
        '/broker-admin/login',
        '/broker-admin/reset-password',
        '/broker-admin/otp',
        '/broker-admin/new-password',
        '/broker-admin/registration-success'
    ].includes(pathname || '');

    useEffect(() => {
        // Skip auth check for public auth pages
        if (isPublicAuthPage) {
            return;
        }

        // Check if user is authenticated
        const token = getAuthToken('broker-admin');

        if (!token) {
            router.push('/broker-admin/login');
        }
    }, [isPublicAuthPage, router]);

    // Public auth pages render without dashboard chrome
    if (isPublicAuthPage) {
        return <>{children}</>;
    }

    // Render with sidebar and header for authenticated pages
    return (
        <NotificationProvider>
            <div className="flex h-screen gap-3 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20 p-3 sm:p-4 print:block print:h-auto print:bg-white print:p-0">
                {/* Mobile Overlay */}
                {isMobile && sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-20 md:hidden print:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <BrokerAdminSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isMobile={isMobile}
                />

                <div className="flex-1 flex flex-col overflow-visible print:block print:overflow-visible print:bg-white">
                    <BrokerHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                    <main className="flex-1 overflow-y-auto rounded-[2rem] border border-white/70 bg-white/60 p-3 sm:p-4 md:p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl print:overflow-visible print:rounded-none print:border-0 print:bg-white print:p-0 print:shadow-none">
                        {children}
                    </main>
                </div>
            </div>
        </NotificationProvider>
    );
}
