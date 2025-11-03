"use client";
import React from 'react';
import {
    Clock,
    CheckCircle,
    Circle,
    TrendingUp,
    AlertTriangle,
    Calendar,
    Target
} from 'lucide-react';
import { EstimatedTimeline } from '@/services/policyStatus';

interface EstimatedTimelineProps {
    timeline: EstimatedTimeline;
    className?: string;
}

const EstimatedTimelineComponent: React.FC<EstimatedTimelineProps> = ({
    timeline,
    className = ''
}) => {
    const getConfidenceColor = (confidence: string) => {
        switch (confidence) {
            case 'high':
                return 'text-green-600 bg-green-100';
            case 'medium':
                return 'text-yellow-600 bg-yellow-100';
            case 'low':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getConfidenceIcon = (confidence: string) => {
        switch (confidence) {
            case 'high':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'medium':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'low':
                return <AlertTriangle className="h-4 w-4 text-red-600" />;
            default:
                return <Circle className="h-4 w-4 text-gray-600" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            }),
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    };

    const getDaysFromNow = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffInDays < 0) {
            return `${Math.abs(diffInDays)} days ago`;
        } else if (diffInDays === 0) {
            return 'Today';
        } else if (diffInDays === 1) {
            return 'Tomorrow';
        } else {
            return `In ${diffInDays} days`;
        }
    };

    const completedMilestones = timeline.milestones.filter(m => m.completed).length;
    const totalMilestones = timeline.milestones.length;
    const progressPercentage = (completedMilestones / totalMilestones) * 100;

    return (
        <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-gray-600" />
                        Estimated Timeline
                    </h3>
                    <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(timeline.confidence)}`}>
                        {getConfidenceIcon(timeline.confidence)}
                        <span className="ml-1 capitalize">{timeline.confidence} Confidence</span>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Progress: {completedMilestones} of {totalMilestones} stages</span>
                    <span className="flex items-center">
                        <Target className="h-4 w-4 mr-1" />
                        {formatDate(timeline.estimatedCompletion).date}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <div className="p-4">
                {/* Current Stage */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-blue-900">Current Stage</h4>
                        <span className="text-xs text-blue-700">Active</span>
                    </div>
                    <p className="text-sm text-blue-800 mb-2">{timeline.currentStage}</p>
                    {timeline.nextStage && (
                        <p className="text-xs text-blue-600">
                            Next: {timeline.nextStage}
                        </p>
                    )}
                </div>

                {/* Milestones */}
                <div className="space-y-4 mb-6">
                    <h4 className="text-sm font-semibold text-gray-900">Milestones</h4>
                    {timeline.milestones.map((milestone, index) => {
                        const { date } = formatDate(milestone.estimatedDate);
                        const isLast = index === timeline.milestones.length - 1;

                        return (
                            <div key={index} className="relative">
                                {/* Timeline line */}
                                {!isLast && (
                                    <div className={`absolute left-4 top-8 w-0.5 h-12 ${milestone.completed ? 'bg-green-300' : 'bg-gray-200'}`}></div>
                                )}

                                <div className="flex items-start space-x-3">
                                    {/* Milestone Icon */}
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${milestone.completed
                                            ? 'bg-green-100 border-green-500'
                                            : 'bg-white border-gray-300'
                                        }`}>
                                        {milestone.completed ? (
                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                        ) : (
                                            <Circle className="h-4 w-4 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Milestone Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h5 className={`text-sm font-medium ${milestone.completed ? 'text-gray-900' : 'text-gray-700'}`}>
                                                {milestone.stage}
                                            </h5>
                                            <div className="text-xs text-gray-500">
                                                {milestone.completed && milestone.actualDate ? (
                                                    <span className="text-green-600 font-medium">
                                                        Completed {formatDate(milestone.actualDate).date}
                                                    </span>
                                                ) : (
                                                    <span>
                                                        {date} ({getDaysFromNow(milestone.estimatedDate)})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Factors Affecting Timeline */}
                <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Factors Affecting Timeline</h4>
                    <div className="space-y-2">
                        {timeline.factors.map((factor, index) => (
                            <div key={index} className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                <p className="text-sm text-gray-700">{factor}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Estimated Completion */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Estimated Completion</span>
                        <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">
                                {formatDate(timeline.estimatedCompletion).date}
                            </div>
                            <div className="text-xs text-gray-600">
                                {getDaysFromNow(timeline.estimatedCompletion)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EstimatedTimelineComponent;