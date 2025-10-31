"use client";
import React from 'react';
import { ClipboardList, Users, CheckCircle, Clock } from 'lucide-react';

interface DualAssignmentStats {
    totalDualAssignments: number;
    niaAssigned: number;
    fullyAssigned: number;
    partiallyComplete: number;
    fullyComplete: number;
}

interface NIADualAssignmentOverviewProps {
    stats: DualAssignmentStats;
}

const NIADualAssignmentOverview: React.FC<NIADualAssignmentOverviewProps> = ({ stats }) => {
    const overviewItems = [
        {
            title: "Total Dual Assignments",
            value: stats.totalDualAssignments,
            icon: ClipboardList,
            color: "text-gray-600",
            bgColor: "bg-gray-100"
        },
        {
            title: "NIA Assigned",
            value: stats.niaAssigned,
            icon: Users,
            color: "text-blue-600",
            bgColor: "bg-blue-100"
        },
        {
            title: "Fully Assigned (Both Orgs)",
            value: stats.fullyAssigned,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-100"
        },
        {
            title: "50% Complete",
            value: stats.partiallyComplete,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-100"
        },
        {
            title: "100% Complete",
            value: stats.fullyComplete,
            icon: CheckCircle,
            color: "text-green-600",
            bgColor: "bg-green-100"
        }
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Dual-Surveyor Assignment Overview</h3>
                    <p className="text-sm text-gray-600">Coordination between AMMC and NIA surveyors</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">NIA Organization</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {overviewItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className={`inline-flex items-center justify-center w-12 h-12 ${item.bgColor} rounded-lg mb-3`}>
                                <Icon className={`h-6 w-6 ${item.color}`} />
                            </div>
                            <div className="text-2xl font-bold text-gray-900 mb-1">{item.value}</div>
                            <div className="text-xs text-gray-600 leading-tight">{item.title}</div>
                        </div>
                    );
                })}
            </div>

            {/* Progress Indicators */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">NIA Assignment Rate</h4>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-blue-700">
                            {stats.totalDualAssignments > 0
                                ? `${Math.round((stats.niaAssigned / stats.totalDualAssignments) * 100)}%`
                                : '0%'
                            } of dual assignments have NIA surveyors
                        </span>
                        <span className="text-sm font-bold text-blue-800">
                            {stats.niaAssigned}/{stats.totalDualAssignments}
                        </span>
                    </div>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                                width: stats.totalDualAssignments > 0
                                    ? `${(stats.niaAssigned / stats.totalDualAssignments) * 100}%`
                                    : '0%'
                            }}
                        ></div>
                    </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-900 mb-2">Completion Rate</h4>
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-green-700">
                            {stats.totalDualAssignments > 0
                                ? `${Math.round((stats.fullyComplete / stats.totalDualAssignments) * 100)}%`
                                : '0%'
                            } of assignments completed
                        </span>
                        <span className="text-sm font-bold text-green-800">
                            {stats.fullyComplete}/{stats.totalDualAssignments}
                        </span>
                    </div>
                    <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                        <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{
                                width: stats.totalDualAssignments > 0
                                    ? `${(stats.fullyComplete / stats.totalDualAssignments) * 100}%`
                                    : '0%'
                            }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NIADualAssignmentOverview;