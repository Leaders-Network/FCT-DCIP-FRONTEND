"use client";
import React from 'react';
import { usePathname } from 'next/navigation';
import BrokerAdminSidebar from '@/components/brokerAdmin/BrokerAdminSideBar'
import BrokerHeader from '@/components/brokerAdmin/BrokerHeader'

interface BrokerAdminLayoutProps {
    children: React.ReactNode;
}

const BrokerAdminLayout: React.FC<BrokerAdminLayoutProps> = ({ children }) => {
    const pathname = usePathname();

    // Don't show sidebar/header on login page
    const isLoginPage = pathname?.includes('/login');

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex h-screen overflow-hidden">
                {/* Broker Admin Sidebar */}
                <BrokerAdminSidebar />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Broker Admin Header */}
                    <BrokerHeader />

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default BrokerAdminLayout;