'use client';

import React, { useState } from 'react';
import { Bell, TestTube, AlertCircle, CheckCircle, FileText, Clock } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { getAuthToken } from '@/utils/auth';

const NotificationTester: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<string[]>([]);
    const { fetchNotifications } = useNotifications();

    // Check token status on component mount
    React.useEffect(() => {
        const token = getAuthToken();
        if (token) {
            addResult(`🔑 Authentication token found (${token.substring(0, 20)}...)`);
        } else {
            addResult('⚠️ No authentication token found - please log in');
        }
    }, []);

    const addResult = (message: string) => {
        setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const testBasicNotification = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                addResult('❌ No authentication token found. Please log in.');
                setLoading(false);
                return;
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${baseUrl}/notifications/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            const data = await response.json();
            if (data.success) {
                addResult('✅ Basic notification created successfully');
                await fetchNotifications();
            } else {
                addResult(`❌ Failed to create basic notification: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addResult(`❌ Error creating basic notification: ${errorMessage}`);
        }
        setLoading(false);
    };

    const testPolicyNotification = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                addResult('❌ No authentication token found. Please log in.');
                setLoading(false);
                return;
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${baseUrl}/test-notifications/test-policy-created`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            const data = await response.json();
            if (data.success) {
                addResult('✅ Policy notification created successfully');
                await fetchNotifications();
            } else {
                addResult(`❌ Failed to create policy notification: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addResult(`❌ Error creating policy notification: ${errorMessage}`);
        }
        setLoading(false);
    };

    const testAssignmentNotification = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                addResult('❌ No authentication token found. Please log in.');
                setLoading(false);
                return;
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${baseUrl}/test-notifications/test-assignment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            const data = await response.json();
            if (data.success) {
                addResult('✅ Assignment notification created successfully');
                await fetchNotifications();
            } else {
                addResult(`❌ Failed to create assignment notification: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addResult(`❌ Error creating assignment notification: ${errorMessage}`);
        }
        setLoading(false);
    };

    const testAllNotifications = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                addResult('❌ No authentication token found. Please log in.');
                setLoading(false);
                return;
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${baseUrl}/test-notifications/test-all`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            const data = await response.json();
            if (data.success) {
                addResult(`✅ Created ${data.notifications?.length || 0} test notifications`);
                await fetchNotifications();
            } else {
                addResult(`❌ Failed to create test notifications: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addResult(`❌ Error creating test notifications: ${errorMessage}`);
        }
        setLoading(false);
    };

    const debugNotificationSystem = async () => {
        setLoading(true);
        try {
            const token = getAuthToken();
            if (!token) {
                addResult('❌ No authentication token found. Please log in.');
                setLoading(false);
                return;
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${baseUrl}/notifications/debug`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            const data = await response.json();
            if (data.success) {
                addResult(`🔍 Debug Info: ${data.debug.notifications.total} total notifications, ${data.debug.notifications.unread} unread`);
                addResult(`🔍 Recent Activities: ${data.debug.recentActivities.policies} policies, ${data.debug.recentActivities.assignments} assignments`);
                addResult(`🔍 User: ${data.debug.currentUser.type} (${data.debug.currentUser.id})`);
            } else {
                addResult(`❌ Failed to get debug info: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addResult(`❌ Error getting debug info: ${errorMessage}`);
        }
        setLoading(false);
    };

    const clearResults = () => {
        setResults([]);
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
                <TestTube className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Notification System Tester</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <button
                    onClick={testBasicNotification}
                    disabled={loading}
                    className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                    <Bell className="h-4 w-4 mr-2" />
                    Test Basic
                </button>

                <button
                    onClick={testPolicyNotification}
                    disabled={loading}
                    className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                    <FileText className="h-4 w-4 mr-2" />
                    Test Policy
                </button>

                <button
                    onClick={testAssignmentNotification}
                    disabled={loading}
                    className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                    <Clock className="h-4 w-4 mr-2" />
                    Test Assignment
                </button>

                <button
                    onClick={testAllNotifications}
                    disabled={loading}
                    className="flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Test All
                </button>

                <button
                    onClick={debugNotificationSystem}
                    disabled={loading}
                    className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Debug Info
                </button>

                <button
                    onClick={clearResults}
                    disabled={loading}
                    className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                    Clear Results
                </button>
            </div>

            {results.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Test Results:</h4>
                    <div className="space-y-1 max-h-60 overflow-y-auto">
                        {results.map((result, index) => (
                            <div key={index} className="text-sm font-mono text-gray-700">
                                {result}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationTester;