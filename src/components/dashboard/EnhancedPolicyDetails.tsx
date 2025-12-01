"use client";
import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    RefreshCw,
    Bell,
    AlertTriangle,
    Eye
} from 'lucide-react';
import { policyStatusService, EnhancedPolicyStatus } from '@/services/policyStatus';
import PolicyNotificationsComponent from './PolicyNotifications';
import PolicyDetailsWithDualSurveyor from './PolicyDetailsWithDualSurveyor';

interface EnhancedPolicyDetailsProps {
    policyId: string;
    onBack: () => void;
}

const EnhancedPolicyDetails: React.FC<EnhancedPolicyDetailsProps> = ({
    policyId,
    onBack
}) => {
    const [enhancedStatus, setEnhancedStatus] = useState<EnhancedPolicyStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'notifications'>('overview');
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        fetchEnhancedStatus();

        // Set up auto-refresh every 2 minutes
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(fetchEnhancedStatus, 2 * 60 * 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [policyId, autoRefresh]);

    const fetchEnhancedStatus = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await policyStatusService.getEnhancedStatus(policyId);

            if (response.success && response.data) {
                setEnhancedStatus(response.data);
            } else {
                setError(response.error || 'Failed to fetch enhanced status');
            }
        } catch (error) {
            console.error('Failed to fetch enhanced status:', error);
            setError(error instanceof Error ? error.message : 'Failed to load enhanced status');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkNotificationAsRead = async (notificationId: string) => {
        try {
            await policyStatusService.markNotificationAsRead(notificationId);

            // Update local state
            if (enhancedStatus && enhancedStatus.notifications) {
                const updatedNotifications = enhancedStatus.notifications.map(n =>
                    n._id === notificationId ? { ...n, read: true } : n
                );
                setEnhancedStatus({
                    ...enhancedStatus,
                    notifications: updatedNotifications
                });
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const getTabIcon = (tab: string) => {
        switch (tab) {
            case 'overview':
                return <Eye className="h-4 w-4" />;
            case 'notifications':
                return <Bell className="h-4 w-4" />;
            default:
                return <Eye className="h-4 w-4" />;
        }
    };

    const getUnreadNotificationCount = () => {
        return enhancedStatus?.notifications?.filter(n => !n.read).length || 0;
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border h-64"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Policy Details</h3>
                <p className="text-sm text-red-600 text-center mb-4">{error}</p>
                <button
                    onClick={fetchEnhancedStatus}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={onBack}
                        className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Policies
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Enhanced Policy Details</h1>
                        <p className="text-gray-600 mt-1">
                            Comprehensive view of your policy status and progress
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {/* Request Claim Button - Only show for completed policies */}
                    {enhancedStatus?.currentStatus?.toLowerCase() === 'completed' && (
                        <button
                            onClick={() => {
                                window.location.href = `/dashboard/policies?action=claim&policyId=${policyId}`;
                            }}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            <Bell className="h-4 w-4 mr-2" />
                            Request Claim
                        </button>
                    )}

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="autoRefresh"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                            Auto-refresh
                        </label>
                    </div>
                    <button
                        onClick={fetchEnhancedStatus}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Status Summary */}
            {enhancedStatus && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className={`text-2xl font-bold ${enhancedStatus.currentStatus?.toLowerCase() === 'completed'
                                    ? 'text-green-600'
                                    : 'text-gray-900'
                                }`}>
                                {enhancedStatus.currentStatus}
                            </div>
                            <div className="text-sm text-gray-600">Current Status</div>
                            {enhancedStatus.currentStatus?.toLowerCase() === 'completed' && (
                                <div className="mt-2">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        ✓ Ready for Claims
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {enhancedStatus.assignmentProgress ? Object.values(enhancedStatus.assignmentProgress).filter(Boolean).length : 0}/6
                            </div>
                            <div className="text-sm text-gray-600">Progress Steps</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{getUnreadNotificationCount()}</div>
                            <div className="text-sm text-gray-600">New Notifications</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {enhancedStatus.estimatedTimeline?.confidence || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-600">Timeline Confidence</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { key: 'overview' as const, label: 'Overview' },
                        { key: 'notifications' as const, label: 'Notifications' }
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.key
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {getTabIcon(tab.key)}
                            <span>{tab.label}</span>
                            {tab.key === 'notifications' && getUnreadNotificationCount() > 0 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    {getUnreadNotificationCount()}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                {activeTab === 'overview' && (
                    <PolicyDetailsWithDualSurveyor
                        policyId={policyId}
                        onBack={() => { }}
                        showBackButton={false}
                    />
                )}

                {activeTab === 'notifications' && enhancedStatus && (
                    <PolicyNotificationsComponent
                        notifications={enhancedStatus.notifications}
                        onMarkAsRead={handleMarkNotificationAsRead}
                    />
                )}
            </div>
        </div>
    );
};

export default EnhancedPolicyDetails;