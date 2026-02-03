'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import {
    Play,
    TestTube,
    FileText,
    CheckCircle,
    AlertTriangle,
    Trash2,
    RefreshCw
} from 'lucide-react';
// Using alert for notifications to match existing codebase

export default function TestMergedReportsPage() {
    const [loading, setLoading] = useState(false);
    const [testResults, setTestResults] = useState<import('@/types/survey.types').TestResultsType | null>(null);
    const [mergedReports, setMergedReports] = useState<import('@/types/survey.types').MergedReportType[]>([]);

    const runTest = async (testType: string) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');

            let endpoint = '';
            switch (testType) {
                case 'create-data':
                    endpoint = '/api/v1/test-merged-reports/create-test-data';
                    break;
                case 'full-workflow':
                    endpoint = '/api/v1/test-merged-reports/full-workflow-test';
                    break;
                case 'cleanup':
                    endpoint = '/api/v1/test-merged-reports/cleanup';
                    break;
                default:
                    throw new Error('Unknown test type');
            }

            const method = testType === 'cleanup' ? 'DELETE' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            const data = await response.json();

            if (data.success) {
                setTestResults(data);
                toast.success(data.message);

                // Refresh merged reports list
                if (testType !== 'cleanup') {
                    await fetchMergedReports();
                } else {
                    setMergedReports([]);
                }
            } else {
                throw new Error(data.message || 'Test failed');
            }

        } catch (error) {
            console.error('Test error:', error);
            toast.error(error instanceof Error ? error.message : 'Test failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchMergedReports = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');

            const response = await fetch('/api/v1/test-merged-reports/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            const data = await response.json();

            if (data.success) {
                setMergedReports(data.data.reports);
            }
        } catch (error) {
            console.error('Error fetching merged reports:', error);
        }
    };

    const triggerMerge = async (policyId: string) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');

            const response = await fetch(`/api/v1/test-merged-reports/trigger-merge/${policyId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            const data = await response.json();

            if (data.success) {
                toast.success(`Merge triggered successfully for policy ${policyId}`);
                await fetchMergedReports();
            } else {
                throw new Error(data.message || 'Merge trigger failed');
            }

        } catch (error) {
            console.error('Merge trigger error:', error);
            toast.error(error instanceof Error ? error.message : 'Merge trigger failed');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchMergedReports();
    }, []);

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Merged Reports Testing Dashboard
                </h1>
                <p className="text-gray-600">
                    Test the dual surveyor report merging workflow and view results.
                </p>
            </div>

            {/* Test Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <TestTube className="w-5 h-5 mr-2" />
                            Create Test Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Create sample dual assignment and survey submissions for testing.
                        </p>
                        <Button
                            onClick={() => runTest('create-data')}
                            disabled={loading}
                            className="w-full"
                        >
                            Create Test Data
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <Play className="w-5 h-5 mr-2" />
                            Full Workflow Test
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Run complete workflow: create data, trigger merging, and generate report.
                        </p>
                        <Button
                            onClick={() => runTest('full-workflow')}
                            disabled={loading}
                            className="w-full"
                            variant="default"
                        >
                            Run Full Test
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <Trash2 className="w-5 h-5 mr-2" />
                            Cleanup Test Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Remove all test data and merged reports from the database.
                        </p>
                        <Button
                            onClick={() => runTest('cleanup')}
                            disabled={loading}
                            className="w-full"
                            variant="destructive"
                        >
                            Cleanup Data
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Test Results */}
            {testResults && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                            Test Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <pre className="text-sm overflow-x-auto">
                                {JSON.stringify(testResults, null, 2)}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Merged Reports List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            Merged Reports ({mergedReports.length})
                        </CardTitle>
                        <Button
                            onClick={fetchMergedReports}
                            variant="outline"
                            size="sm"
                        >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {mergedReports.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No merged reports found</p>
                            <p className="text-sm">Run a test to create merged reports</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {mergedReports.map((report) => (
                                <div key={report._id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h4 className="font-medium">
                                                Policy: {typeof report.policyId === 'object' && report.policyId !== null
                                                    ? (report.policyId.policyNumber || report.policyId._id?.substring(0, 8))
                                                    : (report.policyId as string)?.substring(0, 8)}
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                {typeof report.policyId === 'object' && report.policyId !== null
                                                    ? (report.policyId.propertyDetails?.address || 'No address')
                                                    : 'No address'}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge className={
                                                report.releaseStatus === 'released' ? 'bg-green-100 text-green-800' :
                                                    report.releaseStatus === 'withheld' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                            }>
                                                {report.releaseStatus}
                                            </Badge>
                                            {report.conflictDetected && (
                                                <Badge className="bg-orange-100 text-orange-800">
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                    Conflict
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">Final Recommendation:</span>
                                            <br />
                                            <Badge className={
                                                report.finalRecommendation === 'approve' ? 'bg-green-100 text-green-800' :
                                                    report.finalRecommendation === 'reject' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                            }>
                                                {report.finalRecommendation || 'Pending'}
                                            </Badge>
                                        </div>
                                        <div>
                                            <span className="font-medium">Payment Enabled:</span>
                                            <br />
                                            <Badge className={report.paymentEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                {report.paymentEnabled ? 'Yes' : 'No'}
                                            </Badge>
                                        </div>
                                        <div>
                                            <span className="font-medium">Quality Score:</span>
                                            <br />
                                            <span className="font-mono">
                                                {report.mergingMetadata?.qualityScore || 'N/A'}%
                                            </span>
                                        </div>
                                        <div>
                                            <span className="font-medium">Created:</span>
                                            <br />
                                            <span className="text-gray-600">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {report.conflictDetails && (
                                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                                            <h5 className="font-medium text-orange-900 mb-1">Conflict Details</h5>
                                            <p className="text-sm text-orange-800">
                                                Type: {report.conflictDetails.conflictType} |
                                                Severity: {report.conflictDetails.conflictSeverity}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}