'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getAuthToken } from '@/utils/auth';
import BrokerAdminSidebar from '@/components/brokerAdmin/BrokerAdminSideBar';
import BrokerHeader from '@/components/brokerAdmin/BrokerHeader';

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
                <BrokerHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
