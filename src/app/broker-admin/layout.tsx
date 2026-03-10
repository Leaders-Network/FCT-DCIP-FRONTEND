'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthToken } from '@/utils/auth';
import BrokerAdminSidebar from '@/components/brokerAdmin/BrokerAdminSideBar';
import BrokerHeader from '@/components/brokerAdmin/BrokerHeader';
import { useResponsiveSidebar } from '@/hooks/useResponsiveSidebar';

export default function BrokerAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { isMobile, sidebarOpen, setSidebarOpen, toggleSidebar } = useResponsiveSidebar();

    useEffect(() => {
        // Skip auth check for login page
        if (pathname === '/broker-admin/login') {
            return;
        }

        // Check if user is authenticated
        const token = getAuthToken('broker-admin');

        if (!token) {
            console.log('No broker-admin token found, redirecting to login...');
            router.push('/broker-admin/login');
        }
    }, [pathname, router]);

    // If on login page, render without layout
    if (pathname === '/broker-admin/login') {
        return <>{children}</>;
    }

    // Render with sidebar and header for authenticated pages
    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

                <BrokerAdminSidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    isMobile={isMobile}
                />

            <div className="flex-1 flex flex-col overflow-hidden">
                <BrokerHeader onMenuClick={toggleSidebar} />

                <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
