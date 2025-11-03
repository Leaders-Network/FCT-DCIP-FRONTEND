"use client";
import React, { useState } from 'react';
import {
    Bell,
    BellOff,
    CheckCircle,
    AlertTriangle,
    Info,
    Clock,
    ExternalLink,
    X,
    Eye
} from 'lucide-react';
import { PolicyNotification } from '@/services/policyStatus';

interface PolicyNotificationsProps {
    notifications: PolicyNotification[];
    onMarkAsRead?: (notificationId: string) => void;
    onDismiss?: (notificationId: string) => void;
    className?: string;
}

const PolicyNotificationsComponent: React.FC<PolicyNotificationsProps> = ({
    notifications,
    onMarkAsRead,
    onDismiss,
    className = ''
}) => {
    const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());

    const getNotificationIcon = (type: string, priority: string) => {
        switch (type) {
            case 'status_change':
                return <Info className="h-4 w-4 text-blue-500" />;
            case 'assignment':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'completion':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'conflict':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />;
            case 'report_ready':
                return <Bell className="h-4 w-4 text-purple-500" />;
            default:
                return <Info className="h-4 w-4 text-gray-500" />;
        }
    };

    const getNotificationColor = (type: string, priority: string, read: boolean) => {
        const baseColor = read ? 'bg-gray-50' : 'bg-white';
        const borderColor = read ? 'border-gray-200' : 'border-blue-200';

        if (priority === 'high') {
            return `${baseColor} ${read ? 'border-red-200' : 'border-red-300'} ${!read ? 'ring-1 ring-red-200' : ''}`;
        } else if (priority === 'medium') {
            return `${baseColor} ${read ? 'border-yellow-200' : 'border-yellow-300'} ${!read ? 'ring-1 ring-yellow-200' : ''}`;
        }

        return `${baseColor} ${borderColor} ${!read ? 'ring-1 ring-blue-200' : ''}`;
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        High Priority
                    </span>
                );
            case 'medium':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Medium Priority
                    </span>
                );
            case 'low':
                return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Low Priority
                    </span>
                );
            default:
                return null;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        }
    };

    const toggleExpanded = (notificationId: string) => {
        const newExpanded = new Set(expandedNotifications);
        if (newExpanded.has(notificationId)) {
            newExpanded.delete(notificationId);
        } else {
            newExpanded.add(notificationId);
        }
        setExpandedNotifications(newExpanded);
    };

    const handleMarkAsRead = (notificationId: string) => {
        if (onMarkAsRead) {
            onMarkAsRead(notificationId);
        }
    };

    const handleDismiss = (notificationId: string) => {
        if (onDismiss) {
            onDismiss(notificationId);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (!notifications || notifications.length === 0) {
        return (
            <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
                <BellOff className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No notifications</p>
                <p className="text-sm text-gray-500 mt-1">
                    You'll receive updates about your policy status here
                </p>
            </div>
        );
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Bell className="h-5 w-5 mr-2 text-gray-600" />
                        Notifications
                        {unreadCount > 0 && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {unreadCount} new
                            </span>
                        )}
                    </h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={() => notifications.filter(n => !n.read).forEach(n => handleMarkAsRead(n._id))}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                    Stay updated on your policy progress
                </p>
            </div>

            <div className="divide-y divide-gray-200">
                {notifications.map((notification) => {
                    const isExpanded = expandedNotifications.has(notification._id);

                    return (
                        <div
                            key={notification._id}
                            className={`p-4 transition-colors ${getNotificationColor(notification.type, notification.priority, notification.read)}`}
                        >
                            <div className="flex items-start space-x-3">
                                {/* Icon */}
                                <div className="flex-shrink-0 mt-0.5">
                                    {getNotificationIcon(notification.type, notification.priority)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                                {notification.title}
                                            </h4>
                                            <p className={`text-sm mt-1 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                                                {isExpanded ? notification.message :
                                                    notification.message.length > 100 ?
                                                        `${notification.message.substring(0, 100)}...` :
                                                        notification.message
                                                }
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center space-x-2 ml-4">
                                            {notification.message.length > 100 && (
                                                <button
                                                    onClick={() => toggleExpanded(notification._id)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                                                >
                                                    {isExpanded ? 'Show less' : 'Show more'}
                                                </button>
                                            )}

                                            {!notification.read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                                                    title="Mark as read"
                                                >
                                                    <Eye className="h-3 w-3" />
                                                </button>
                                            )}

                                            {onDismiss && (
                                                <button
                                                    onClick={() => handleDismiss(notification._id)}
                                                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                                                    title="Dismiss"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-xs text-gray-500 flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {formatDate(notification.timestamp)}
                                            </span>
                                            {getPriorityBadge(notification.priority)}
                                        </div>

                                        {/* Action URL */}
                                        {notification.actionUrl && (
                                            <a
                                                href={notification.actionUrl}
                                                className="text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center"
                                            >
                                                View Details
                                                <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PolicyNotificationsComponent;