"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import PolicyManagement from '@/components/admin/PolicyManagement';

const NIAPoliciesPage = () => {
    const router = useRouter();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Builder Liability Policies</h1>
                    <p className="text-gray-600 mt-1">
                        Manage and review all Builder Liability insurance policies
                    </p>
                </div>
            </div>

            <PolicyManagement />
        </div>
    );
};

export default NIAPoliciesPage;
