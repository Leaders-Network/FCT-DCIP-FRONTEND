'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import {
    Play,
    RefreshCw,
    FileText,
    AlertTriangle,
    CheckCircle,
    Database,
    Zap
} from 'lucide-react';

export default function DebugMergedReportsPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<import('@/types/survey.types').StatusType | null>(null);
    const [missingReports, setMissingReports] = useState<import('@/types/survey.types').MissingReportsType | null>(null);

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');

            const response = await fetch('/api/v1/debug-merged-reports/status', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            const data = await response.json();
            if (data.success) {
                setStatus(data.data);
            }
        } catch (error) {
            console.error('Error fetching status:', error);
            toast.error('Failed to fetch status');
        } finally {
            setLoading(false);
        }
    };

    const fetchMissingReports = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');

            const response = await fetch('/api/v1/debug-merged-reports/missing-reports', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            const data = await response.json();
            if (data.success) {
                setMissingReports(data.data);
            }
        } catch (error) {
            console.error('Error fetching missing reports:', error);
            toast.error('Failed to fetch missing reports');
        }
    };

    const triggerAllMissing = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');

            const response = await fetch('/api/v1/debug-merged-reports/trigger-all-missing', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success(`Success! ${data.message}`);
                // Refresh data
                await fetchStatus();
                await fetchMissingReports();
            } else {
                toast.error(`Failed: ${data.message}`);
            }
        } catch (error) {
            console.error('Error triggering merge:', error);
            toast.error('Failed to trigger merge');
        } finally {
            setLoading(false);
        }
    };

    const triggerSingleMerge = async (policyId: string) => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');

            const response = await fetch(`/api/v1/debug-merged-reports/trigger-merge/${policyId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            const data = await response.json();
            if (data.success) {
                toast.success(`Merge triggered successfully for policy ${policyId}`);
                await fetchMissingReports();
            } else {
                toast.error(`Failed to trigger merge: ${data.message}`);
            }
        } catch (error) {
            console.error('Error triggering single merge:', error);
            toast.error('Failed to trigger merge');
        }
    };

    useEffect(() => {
        fetchStatus();
        fetchMissingReports();
    }, []);

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Debug Merged Reports System
                </h1>
                <p className="text-gray-600">
                    Debug and fix issues with the merged reports workflow.
                </p>
            </div>

            {/* Control Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Button
                    onClick={fetchStatus}
                    disabled={loading}
                    className="flex items-center justify-center"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh Status
                </Button>

                <Button
                    onClick={fetchMissingReports}
                    disabled={loading}
                    variant="outline"
                    className="flex items-center justify-center"
                >
                    <Database className="w-4 h-4 mr-2" />
                    Check Missing Reports
                </Button>

                <Button
                    onClick={triggerAllMissing}
                    disabled={loading || !missingReports?.totalMissingReports}
                    className="flex items-center justify-center bg-green-600 hover:bg-green-700"
                >
                    <Zap className="w-4 h-4 mr-2" />
                    Fix All Missing Reports
                </Button>
            </div>

            {/* System Status */}
            {status && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Database className="w-5 h-5 mr-2" />
                            System Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{status.summary?.totalPolicies || 0}</div>
                                <div className="text-sm text-gray-600">Total Policies</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">{status.summary?.totalDualAssignments || 0}</div>
                                <div className="text-sm text-gray-600">Dual Assignments</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{status.summary?.totalSurveySubmissions || 0}</div>
                                <div className="text-sm text-gray-600">Survey Submissions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">{status.summary?.totalMergedReports || 0}</div>
                                <div className="text-sm text-gray-600">Merged Reports</div>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-lg font-semibold text-blue-500">{status.summary?.ammcSubmissions || 0}</div>
                                <div className="text-xs text-gray-500">AMMC Submissions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-indigo-500">{status.summary?.niaSubmissions || 0}</div>
                                <div className="text-xs text-gray-500">NIA Submissions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-green-500">{status.summary?.completedDualAssignments || 0}</div>
                                <div className="text-xs text-gray-500">Completed Assignments</div>
                            </div>
                            <div className="text-center">
                                <div className="text-lg font-semibold text-yellow-500">{status.summary?.pendingDualAssignments || 0}</div>
                                <div className="text-xs text-gray-500">Pending Assignments</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Missing Reports */}
            {missingReports && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                                Missing Merged Reports ({missingReports.totalMissingReports || 0})
                            </div>
                            {(missingReports.totalMissingReports || 0) > 0 && (
                                <Badge className="bg-orange-100 text-orange-800">
                                    Action Required
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {(missingReports.totalMissingReports || 0) === 0 ? (
                            <div className="text-center py-8 text-green-600">
                                <CheckCircle className="w-12 h-12 mx-auto mb-3" />
                                <h3 className="text-lg font-medium">All Good!</h3>
                                <p>No missing merged reports found. The system is working correctly.</p>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                    <h4 className="font-medium text-orange-900 mb-2">Issues Found:</h4>
                                    <ul className="text-sm text-orange-800 space-y-1">
                                        <li>• {missingReports.totalPoliciesWithBothSubmissions || 0} policies have both AMMC and NIA submissions</li>
                                        <li>• {missingReports.totalExistingMergedReports || 0} merged reports already exist</li>
                                        <li>• {missingReports.totalMissingReports || 0} policies are missing merged reports</li>
                                    </ul>
                                </div>

                                <div className="space-y-3">
                                    <h5 className="font-medium">Policies Missing Merged Reports:</h5>
                                    {missingReports.missingReportPolicies?.map((policy: { _id: string; policyNumber: string; status: string; propertyDetails: { address: string } }) => (
                                        <div key={policy._id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div>
                                                <div className="font-medium">Policy: {policy._id.substring(0, 8)}...</div>
                                                <div className="text-sm text-gray-600">
                                                    {policy.propertyDetails?.address || 'No address'}
                                                </div>
                                                <Badge className="mt-1">
                                                    Status: {policy.status}
                                                </Badge>
                                            </div>
                                            <Button
                                                onClick={() => triggerSingleMerge(policy._id)}
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Play className="w-4 h-4 mr-1" />
                                                Trigger Merge
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}