'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ReportViewer } from '@/components/LazyComponents';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ReportId } from '@/types/utility.types';

interface ReportPageParams {
    reportId: ReportId;
    [key: string]: string | string[];
}

const ReportPage: React.FC = () => {
    const params = useParams<ReportPageParams>();
    const reportId = params.reportId;

    if (!reportId) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Not Found</h1>
                    <p className="text-gray-600 mb-4">The requested report could not be found.</p>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Dashboard</span>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <div className="bg-white border-b">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
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