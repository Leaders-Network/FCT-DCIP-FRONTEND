'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Zap,
    FileText,
    CheckCircle,
    Users,
    Database
} from 'lucide-react';

export default function GenerateReportsPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const generateAllReports = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');

            const response = await fetch('/api/v1/quick-test/create-all-missing-reports', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            const data = await response.json();
            if (data.success) {
                setResult(data);
                alert(`Success! Created ${data.data.created} merged reports for users to see.`);
            } else {
                alert(`Failed: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error generating reports:', error);
            alert('Failed to generate reports');
        } finally {
            setLoading(false);
        }
    };

    const checkStatus = async () => {
        try {
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');

            const response = await fetch('/api/v1/quick-test/status', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            const data = await response.json();
            if (data.success) {
                setResult(data);
            }
        } catch (error) {
            console.error('Error checking status:', error);
            alert('Failed to check status');
        }
    };

    React.useEffect(() => {
        checkStatus();
    }, []);

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Generate Merged Reports for Users
                </h1>
                <p className="text-gray-600">
                    Create merged reports so users can see their dual surveyor assessments.
                </p>
            </div>

            {/* Current Status */}
            {result && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Database className="w-5 h-5 mr-2" />
                            Current System Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {result.data?.counts?.policies || result.counts?.policies || 0}
                                </div>
                                <div className="text-sm text-gray-600">Total Policies</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {result.data?.counts?.submissions || result.counts?.submissions || 0}
                                </div>
                                <div className="text-sm text-gray-600">Survey Submissions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {result.data?.counts?.mergedReports || result.counts?.mergedReports || 0}
                                </div>
                                <div className="text-sm text-gray-600">Merged Reports</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {result.data?.counts?.dualAssignments || result.counts?.dualAssignments || 0}
                                </div>
                                <div className="text-sm text-gray-600">Dual Assignments</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                        Generate Missing Merged Reports
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">What this will do:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Find all policies that don't have merged reports yet</li>
                                <li>• Create sample merged reports with both AMMC and NIA assessments</li>
                                <li>• Make reports visible to users in their dashboard</li>
                                <li>• Include risk assessments, property conditions, and recommendations</li>
                            </ul>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                onClick={generateAllReports}
                                disabled={loading}
                                className="flex items-center bg-green-600 hover:bg-green-700"
                            >
                                <Zap className="w-4 h-4 mr-2" />
                                {loading ? 'Generating...' : 'Generate All Missing Reports'}
                            </Button>

                            <Button
                                onClick={checkStatus}
                                variant="outline"
                                className="flex items-center"
                            >
                                <Database className="w-4 h-4 mr-2" />
                                Refresh Status
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            {result && result.data?.created !== undefined && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                            Generation Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">{result.data.created}</div>
                                <div className="text-sm text-green-800">Reports Created</div>
                            </div>
                            <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="text-2xl font-bold text-yellow-600">{result.data.skipped}</div>
                                <div className="text-sm text-yellow-800">Already Existed</div>
                            </div>
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{result.data.total}</div>
                                <div className="text-sm text-blue-800">Total Policies</div>
                            </div>
                        </div>

                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">✅ Success!</h4>
                            <p className="text-sm text-green-800">
                                Users can now see their merged reports in the dashboard at <code>/dashboard/reports</code>
                            </p>
                        </div>

                        {result.data.reports && result.data.reports.length > 0 && (
                            <div className="mt-4">
                                <h5 className="font-medium mb-2">Created Reports:</h5>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {result.data.reports.slice(0, 10).map((report: { _id: string; policyId: string; status: string; createdAt: string }, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                                            <div>
                                                <div className="font-medium text-sm">
                                                    Policy: {report.policyId.substring(0, 8)}...
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    {(report as any).propertyAddress || 'No address'}
                                                </div>
                                            </div>
                                            <Badge className="bg-green-100 text-green-800">
                                                <FileText className="w-3 h-3 mr-1" />
                                                Created
                                            </Badge>
                                        </div>
                                    ))}
                                    {result.data.reports.length > 10 && (
                                        <div className="text-sm text-gray-500 text-center">
                                            ... and {result.data.reports.length - 10} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}