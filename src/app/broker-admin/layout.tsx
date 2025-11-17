'use client';

import { useEffect } from 'react';
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
            <BrokerAdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <BrokerHeader />

                <main className="flex-1 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
