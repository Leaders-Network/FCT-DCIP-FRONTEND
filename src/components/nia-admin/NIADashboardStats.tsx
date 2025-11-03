"use client";
import React from 'react';
import { Users, FileText, Clock, CheckCircle } from 'lucide-react';

interface StatsProps {
    totalSurveyors: number;
    activeSurveyors: number;
    totalAssignments: number;
    completedAssignments: number;
}

const NIADashboardStats: React.FC<StatsProps> = ({
    totalSurveyors,
    activeSurveyors,
    totalAssignments,
    completedAssignments
}) => {
    const stats = [
        {
            title: "Total NIA Surveyors",
            value: totalSurveyors,
            icon: Users,
            color: "bg-blue-500",
            bgColor: "bg-blue-50"
        },
        {
            title: "Active Surveyors",
            value: activeSurveyors,
            icon: CheckCircle,
            color: "bg-green-500",
            bgColor: "bg-green-50"
        },
        {
            title: "Total Assignments",
            value: totalAssignments,
            icon: FileText,
            color: "bg-purple-500",
            bgColor: "bg-purple-50"
        },
        {
            title: "Completed",
            value: completedAssignments,
            icon: Clock,
            color: "bg-orange-500",
            bgColor: "bg-orange-50"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className={`${stat.bgColor} p-6 rounded-lg border`}>
                        <div className="flex items-center">
                            <div className={`p-2 ${stat.color} rounded-lg`}>
                                <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default NIADashboardStats;