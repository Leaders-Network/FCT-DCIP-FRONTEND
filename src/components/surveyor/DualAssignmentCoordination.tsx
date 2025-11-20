'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    Phone,
    Mail,
    MapPin,
    Calendar,
    Clock,
    CheckCircle,
    AlertTriangle,
    MessageSquare,
    FileText,
    Building,
    User,
    Shield,
    Eye,
    Send,
    RefreshCw
} from 'lucide-react';

interface SurveyorInfo {
    _id: string;
    name: string;
    email: string;
    phone: string;
    license: string;
    organization: 'AMMC' | 'NIA';
    status: string;
    submissionDate?: string;
    completionPercentage: number;
}

interface DualAssignmentCoordinationProps {
    assignmentId: string;
    dualAssignmentId: string;
    currentSurveyorOrg: 'AMMC' | 'NIA';
}

interface CoordinationMessage {
    _id: string;
    from: string;
    fromOrganization: 'AMMC' | 'NIA';
    message: string;
    timestamp: string;
    type: 'message' | 'status_update' | 'question' | 'coordination';
}

const DualAssignmentCoordination: React.FC<DualAssignmentCoordinationProps> = ({
    assignmentId,
    dualAssignmentId,
    currentSurveyorOrg
}) => {
    const [dualAssignmentData, setDualAssignmentData] = useState<{
        _id: string;
        policyId: string;
        assignmentStatus: string;
        completionStatus: number;
        ammcSurveyorContact?: SurveyorInfo;
        niaSurveyorContact?: SurveyorInfo;
        priority: string;
        estimatedCompletion: { overallDeadline: string };
    } | null>(null);
    const [partnerSurveyor, setPartnerSurveyor] = useState<SurveyorInfo | null>(null);
    const [currentSurveyor, setCurrentSurveyor] = useState<SurveyorInfo | null>(null);
    const [messages, setMessages] = useState<CoordinationMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDualAssignmentData();
        fetchCoordinationMessages();
    }, [dualAssignmentId]);

    const fetchDualAssignmentData = async () => {
        try {
            const response = await fetch(`/api/v1/dual-assignment/${dualAssignmentId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dual assignment data');
            }

            const data = await response.json();
            setDualAssignmentData(data.data);

            // Set partner and current surveyor info
            const ammcSurveyor = data.data.ammcSurveyorInfo;
            const niaSurveyor = data.data.niaSurveyorInfo;

            if (currentSurveyorOrg === 'AMMC') {
                setCurrentSurveyor(ammcSurveyor);
                setPartnerSurveyor(niaSurveyor);
            } else {
                setCurrentSurveyor(niaSurveyor);
                setPartnerSurveyor(ammcSurveyor);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const fetchCoordinationMessages = async () => {
        try {
            const response = await fetch(`/api/v1/dual-assignment/${dualAssignmentId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch coordination messages:', err);
        }
    };

    const sendCoordinationMessage = async () => {
        if (!newMessage.trim()) return;

        setSendingMessage(true);
        try {
            const response = await fetch(`/api/v1/dual-assignment/${dualAssignmentId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    message: newMessage,
                    type: 'coordination'
                })
            });

            if (response.ok) {
                setNewMessage('');
                fetchCoordinationMessages(); // Refresh messages
            } else {
                throw new Error('Failed to send message');
            }
        } catch (err) {
            console.error('Failed to send message:', err);
            alert('Failed to send message. Please try again.');
        } finally {
            setSendingMessage(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-100';
            case 'in-progress':
                return 'text-blue-600 bg-blue-100';
            case 'assigned':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-green-500';
        if (percentage >= 75) return 'bg-blue-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-gray-400';
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3 text-red-600">
                    <AlertTriangle className="w-6 h-6" />
                    <span className="font-medium">Error Loading Coordination Data</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Dual Assignment Overview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-indigo-600" />
                        Dual Surveyor Coordination
                    </h3>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Overall Progress:</span>
                        <span className="font-semibold text-indigo-600">
                            {dualAssignmentData?.completionStatus || 0}%
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Dual Survey Progress</span>
                        <span>{dualAssignmentData?.completionStatus || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(dualAssignmentData?.completionStatus || 0)}`}
                            style={{ width: `${dualAssignmentData?.completionStatus || 0}%` }}
                        ></div>
                    </div>
                </div>

                {/* Surveyor Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Current Surveyor */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Your Information ({currentSurveyorOrg})
                        </h4>
                        {currentSurveyor && (
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-blue-800">
                                    <User className="w-4 h-4 mr-2" />
                                    <span className="font-medium">{currentSurveyor.name}</span>
                                </div>
                                <div className="flex items-center text-blue-700">
                                    <Mail className="w-4 h-4 mr-2" />
                                    {currentSurveyor.email}
                                </div>
                                <div className="flex items-center text-blue-700">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {currentSurveyor.phone}
                                </div>
                                <div className="flex items-center text-blue-700">
                                    <FileText className="w-4 h-4 mr-2" />
                                    License: {currentSurveyor.license}
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentSurveyor.status)}`}>
                                        {currentSurveyor.status.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-blue-600">
                                        {currentSurveyor.completionPercentage}% Complete
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Partner Surveyor */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-3 flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Partner Surveyor ({partnerSurveyor?.organization})
                        </h4>
                        {partnerSurveyor && (
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center text-green-800">
                                    <User className="w-4 h-4 mr-2" />
                                    <span className="font-medium">{partnerSurveyor.name}</span>
                                </div>
                                <div className="flex items-center text-green-700">
                                    <Mail className="w-4 h-4 mr-2" />
                                    <a href={`mailto:${partnerSurveyor.email}`} className="hover:underline">
                                        {partnerSurveyor.email}
                                    </a>
                                </div>
                                <div className="flex items-center text-green-700">
                                    <Phone className="w-4 h-4 mr-2" />
                                    <a href={`tel:${partnerSurveyor.phone}`} className="hover:underline">
                                        {partnerSurveyor.phone}
                                    </a>
                                </div>
                                <div className="flex items-center text-green-700">
                                    <FileText className="w-4 h-4 mr-2" />
                                    License: {partnerSurveyor.license}
                                </div>
                                <div className="flex items-center justify-between mt-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(partnerSurveyor.status)}`}>
                                        {partnerSurveyor.status.toUpperCase()}
                                    </span>
                                    <span className="text-xs text-green-600">
                                        {partnerSurveyor.completionPercentage}% Complete
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Contact Actions */}
                <div className="mt-6 flex items-center justify-center space-x-4">
                    <a
                        href={`mailto:${partnerSurveyor?.email}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                        <Mail className="w-4 h-4 mr-2" />
                        Email Partner
                    </a>
                    <a
                        href={`tel:${partnerSurveyor?.phone}`}
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Partner
                    </a>
                </div>
            </div>

            {/* Coordination Messages */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Coordination Messages
                    </h3>
                </div>

                {/* Messages List */}
                <div className="p-6">
                    <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                        {messages.length > 0 ? (
                            messages.map((message) => (
                                <div
                                    key={message._id}
                                    className={`flex ${message.fromOrganization === currentSurveyorOrg ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.fromOrganization === currentSurveyorOrg
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-xs font-medium">
                                                {message.fromOrganization} - {message.from}
                                            </span>
                                            <span className="text-xs opacity-75">
                                                {new Date(message.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p className="text-sm">{message.message}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="text-sm">No coordination messages yet</p>
                                <p className="text-xs">Start a conversation with your partner surveyor</p>
                            </div>
                        )}
                    </div>

                    {/* Message Input */}
                    <div className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a coordination message..."
                            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onKeyDown={(e) => e.key === 'Enter' && sendCoordinationMessage()}
                        />
                        <button
                            onClick={sendCoordinationMessage}
                            disabled={sendingMessage || !newMessage.trim()}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sendingMessage ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Conflict Detection Alert */}
            {dualAssignmentData?.conflictDetected && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-3">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                        <h3 className="font-medium text-orange-800">Conflict Detected</h3>
                    </div>
                    <p className="text-sm text-orange-700 mb-4">
                        Discrepancies have been detected between your assessment and your partner's assessment.
                        Please coordinate to resolve these differences.
                    </p>
                    <div className="flex items-center space-x-3">
                        <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View Conflict Details
                        </button>
                        <button className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Discuss with Partner
                        </button>
                    </div>
                </div>
            )}

            {/* Submission Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <Building className="w-5 h-5 text-blue-600" />
                            <span className="font-medium text-blue-900">{currentSurveyorOrg} Survey</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentSurveyor?.status || 'assigned')}`}>
                            {currentSurveyor?.status?.toUpperCase() || 'ASSIGNED'}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <Building className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-900">{partnerSurveyor?.organization} Survey</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(partnerSurveyor?.status || 'assigned')}`}>
                            {partnerSurveyor?.status?.toUpperCase() || 'ASSIGNED'}
                        </span>
                    </div>
                </div>

                {currentSurveyor?.status === 'completed' && partnerSurveyor?.status === 'completed' && (
                    <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-green-800">Both surveys completed!</span>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                            Reports will be automatically merged and released to the user within 5 minutes.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DualAssignmentCoordination;