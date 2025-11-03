"use client";
import React from 'react';
import { FileText, Clock, MapPin, User } from 'lucide-react';

interface Assignment {
    _id: string;
    ammcId?: {
        propertyDetails?: {
            propertyType?: string;
            address?: string;
        };
        contactDetails?: {
            fullName?: string;
        };
    };
    status: string;
    assignedAt: string;
    deadline: string;
}

interface NIARecentAssignmentsProps {
    assignments: Assignment[];
}

const NIARecentAssignments: React.FC<NIARecentAssignmentsProps> = ({ assignments }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'in-progress':
                return 'bg-purple-100 text-purple-800';
            case 'accepted':
                return 'bg-blue-100 text-blue-800';
            case 'assigned':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (!assignments || assignments.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent NIA Assignments</h3>
                <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No recent assignments</p>
                    <p className="text-xs">NIA assignments will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent NIA Assignments</h3>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View All
                </button>
            </div>

            <div className="space-y-4">
                {assignments.slice(0, 5).map((assignment) => (
                    <div key={assignment._id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {assignment.ammcId?.propertyDetails?.propertyType || 'Property Survey'}
                                </h4>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                    {assignment.status}
                                </span>
                            </div>

                            <div className="mt-1 flex items-center text-xs text-gray-500 space-x-4">
                                <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span className="truncate">
                                        {assignment.ammcId?.propertyDetails?.address || 'No address'}
                                    </span>
                                </div>
                                <div className="flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    <span className="truncate">
                                        {assignment.ammcId?.contactDetails?.fullName || 'No contact'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>Assigned: {formatDate(assignment.assignedAt)}</span>
                                </div>
                                <div className="flex items-center">
                                    <span>Due: {formatDate(assignment.deadline)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NIARecentAssignments;