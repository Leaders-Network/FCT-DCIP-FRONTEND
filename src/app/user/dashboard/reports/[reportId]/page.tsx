'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ReportViewer from '@/components/user/ReportViewer';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const ReportPage: React.FC = () => {
    const params = useParams();
    const reportId = params.reportId as string;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <Link
                        href="/user/dashboard"
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </Link>
                </div>
            </div>

            {/* Report content */}
            <ReportViewer reportId={reportId} />
        </div>
    );
};

export default ReportPage;