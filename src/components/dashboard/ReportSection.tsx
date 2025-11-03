'use client';

import React, { useState, useEffect } from 'react';
import ReportProcessingStatus from '@/components/user/ReportProcessingStatus';
import UserReportsList from '@/components/user/UserReportsList';
import { FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface ReportSectionProps {
    userPolicies: any[];
}

const ReportSection: React.FC<ReportSectionProps> = ({ userPolicies }) => {
    const [activeTab, setActiveTab] = useState<'status' | 'reports'>('status');
    const [reportStats, setReportStats] = useState({
        processing: 0,
        available: 0,
        underReview: 0,
        total: 0
    });
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        fetchReportStats();
    }, [userPolicies, refreshTrigger]);

    const fetchReportStats = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');
            if (!token) return;

            const response = await fetch('/api/v1/report-release/user/reports?page=1&limit=100', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const reports = data.data.reports || [];

                const stats = {
                    processing: reports.filter((r: any) => r.releaseStatus === 'pending').length,
                    available: reports.filter((r: any) => r.releaseStatus === 'released').length,
                    underReview: reports.filter((r: any) => r.releaseStatus === 'withheld').length,
                    total: reports.length
                };

                setReportStats(stats);
            }
        } catch (error) {
            console.error('Failed to fetch report stats:', error);
        }
    };

    const handleReportReady = (reportId: string) => {
        // Refresh stats when a new report becomes available
        setRefreshTrigger(prev => prev + 1);
    };

    // Get policies that might have processing reports
    const policiesWithPotentialReports = userPolicies.filter(policy =>
        ['assigned', 'surveyed', 'approved'].includes(policy.status)
    );

    return (
        <div className="space-y-6">
            {/* Report Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg mr-3 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-xl font-bold">{reportStats.processing}</div>
                        <div className="text-xs text-gray-600">Processing</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg mr-3 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                        <div className="text-xl font-bold">{reportStats.available}</div>
                        <div className="text-xs text-gray-600">Available</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg mr-3 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                        <div className="text-xl font-bold">{reportStats.underReview}</div>
                        <div className="text-xs text-gray-600">Under Review</div>
                    </div>
                </div>

                <div className="bg-white rounded-lg p-4 flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg mr-3 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                        <div className="text-xl font-bold">{reportStats.total}</div>
                        <div className="text-xs text-gray-600">Total Reports</div>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('status')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'status'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Processing Status
                        </button>
                        <button
                            onClick={() => setActiveTab('reports')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            My Reports ({reportStats.total})
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'status' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Report Processing Status
                                </h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Track the progress of your property assessment reports. Reports are automatically
                                    generated when both AMMC and NIA surveyors complete their assessments.
                                </p>
                            </div>

                            {policiesWithPotentialReports.length > 0 ? (
                                <div className="space-y-4">
                                    {policiesWithPotentialReports.map((policy) => (
                                        <div key={policy._id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        Policy {policy._id.substring(0, 8).toUpperCase()}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {policy.propertyDetails?.address || 'Property Address'}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${policy.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        policy.status === 'surveyed' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {policy.status.toUpperCase()}
                                                </span>
                                            </div>

                                            <ReportProcessingStatus
                                                policyId={policy._id}
                                                onReportReady={handleReportReady}
                                                refreshInterval={30000}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <h4 className="font-medium mb-2">No Active Processing</h4>
                                    <p className="text-sm">
                                        You don't have any policies currently being processed for reports.
                                        Reports will appear here once your policies are assigned to surveyors.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <div>
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Assessment Reports
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Download and review your completed property assessment reports.
                                    Each report contains evaluations from both AMMC and NIA surveyors.
                                </p>
                            </div>

                            <UserReportsList refreshTrigger={refreshTrigger} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportSection;