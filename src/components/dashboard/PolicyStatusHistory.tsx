"use client";
import React from 'react';
import {
    Clock,
    CheckCircle,
    AlertCircle,
    User,
    FileText,
    Users,
    Building
} from 'lucide-react';
import { PolicyStatusHistory } from '@/services/policyStatus';

interface PolicyStatusHistoryProps {
    history: PolicyStatusHistory[];
    className?: string;
}

const PolicyStatusHistoryComponent: React.FC<PolicyStatusHistoryProps> = ({
    history,
    className = ''
}) => {
    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'submitted':
                return <FileText className="h-4 w-4 text-blue-500" />;
            case 'assigned':
                return <Users className="h-4 w-4 text-yellow-500" />;
            case 'in_progress':
                return <Clock className="h-4 w-4 text-orange-500" />;
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'rejected':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'submitted':
                return 'bg-blue-50 border-blue-200';
            case 'assigned':
                return 'bg-yellow-50 border-yellow-200';
            case 'in_progress':
                return 'bg-orange-50 border-orange-200';
            case 'completed':
                return 'bg-green-50 border-green-200';
            case 'rejected':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const formatStatus = (status: string) => {
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    if (!history || history.length === 0) {
        return (
            <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No status history available</p>
            </div>
        );
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-gray-600" />
                    Status History
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                    Track your policy's progress through each stage
                </p>
            </div>

            <div className="p-4">
                <div className="space-y-4">
                    {history.map((item, index) => {
                        const { date, time } = formatDate(item.timestamp);
                        const isLatest = index === 0;

                        return (
                            <div key={item._id} className="relative">
                                {/* Timeline line */}
                                {index < history.length - 1 && (
                                    <div className="absolute left-6 top-8 w-0.5 h-16 bg-gray-200"></div>
                                )}

                                <div className={`flex items-start space-x-4 p-4 rounded-lg border ${getStatusColor(item.status)} ${isLatest ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}`}>
                                    {/* Status Icon */}
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isLatest ? 'bg-blue-100' : 'bg-white'} border-2 ${isLatest ? 'border-blue-500' : 'border-gray-300'}`}>
                                        {getStatusIcon(item.status)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-sm font-semibold text-gray-900">
                                                {formatStatus(item.status)}
                                                {isLatest && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        Current
                                                    </span>
                                                )}
                                            </h4>
                                            <div className="text-xs text-gray-500">
                                                <div>{date}</div>
                                                <div>{time}</div>
                                            </div>
                                        </div>

                                        {/* Notes */}
                                        {item.notes && (
                                            <p className="text-sm text-gray-700 mb-2">
                                                {item.notes}
                                            </p>
                                        )}

                                        {/* Metadata */}
                                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                                            <div className="flex items-center">
                                                <User className="h-3 w-3 mr-1" />
                                                <span>Updated by {item.updatedBy}</span>
                                            </div>

                                            {item.metadata?.assignmentType && (
                                                <div className="flex items-center">
                                                    <Building className="h-3 w-3 mr-1" />
                                                    <span className="uppercase">{item.metadata.assignmentType}</span>
                                                </div>
                                            )}

                                            {item.metadata?.surveyorName && (
                                                <div className="flex items-center">
                                                    <Users className="h-3 w-3 mr-1" />
                                                    <span>{item.metadata.surveyorName}</span>
                                                </div>
                                            )}

                                            {item.metadata?.completionPercentage !== undefined && (
                                                <div className="flex items-center">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    <span>{item.metadata.completionPercentage}% Complete</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default PolicyStatusHistoryComponent;