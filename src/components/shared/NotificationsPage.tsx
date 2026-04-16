'use client';

import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { usePathname, useRouter } from 'next/navigation';
import { Notification } from '@/types/notification.types';

const NotificationsPage: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const notificationsPath = pathname?.startsWith('/admin/dashboard')
        ? '/admin/dashboard/notifications'
        : pathname?.startsWith('/broker-admin')
            ? '/broker-admin/notifications'
            : pathname?.startsWith('/nia-admin')
                ? '/nia-admin/notifications'
                : pathname?.startsWith('/surveyor/dashboard')
                    ? '/surveyor/dashboard/notifications'
                    : '/dashboard/notifications';

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread' && n.read) return false;
        if (typeFilter !== 'all' && n.type !== typeFilter) return false;
        return true;
    });

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            await markAsRead(notification._id);
        }
        router.push(`${notificationsPath}/${notification._id}`);
    };

    const getNotificationIcon = (type: string) => {
        const iconMap: Record<string, string> = {
            policy_created: '📋',
            policy_assigned: '👤',
            assignment_created: '📝',
            survey_submitted: '✅',
            report_ready: '📄',
            payment_required: '💳',
            assignment_deadline_approaching: '⏰',
            conflict_detected: '⚠️',
            system_alert: '🔔',
        };
        return iconMap[type] || '📬';
    };

    const getPriorityColor = (priority: string) => {
        const colorMap: Record<string, string> = {
            low: 'bg-gray-100 text-gray-800 border-gray-300',
            medium: 'bg-blue-100 text-blue-800 border-blue-300',
            high: 'bg-orange-100 text-orange-800 border-orange-300',
            urgent: 'bg-red-100 text-red-800 border-red-300',
        };
        return colorMap[priority] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return notificationDate.toLocaleDateString();
    };

    const notificationTypes = [
        { value: 'all', label: 'All Types' },
        { value: 'policy_created', label: 'Policy Created' },
        { value: 'assignment_created', label: 'Assignments' },
        { value: 'survey_submitted', label: 'Surveys' },
        { value: 'report_ready', label: 'Reports' },
        { value: 'payment_required', label: 'Payments' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <Bell className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                                <p className="text-sm text-gray-600">
                                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                                </p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Mark All Read
                            </button>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center space-x-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">Filter:</span>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                All ({notifications.length})
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${filter === 'unread'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                Unread ({unreadCount})
                            </button>
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {notificationTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {notifications.length === 0 ? 'No notifications yet' : 'No matching notifications'}
                            </h3>
                            <p className="text-gray-600">
                                {filter === 'unread' ? "You're all caught up!" :
                                    notifications.length === 0 ? 'Notifications will appear here when you have activity on your account.' :
                                        'Try adjusting your filters to see more notifications.'}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all cursor-pointer ${!notification.read ? 'border-l-4 border-l-blue-600' : ''
                                    }`}
                            >
                                <div className="flex items-start space-x-4">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 text-3xl">
                                        {getNotificationIcon(notification.type)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className={`text-base font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                                                {notification.title}
                                            </h3>
                                            {!notification.read && (
                                                <span className="ml-2 h-2.5 w-2.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xs text-gray-500">
                                                    {formatTimeAgo(notification.createdAt)}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(notification.priority)}`}>
                                                    {notification.priority}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {!notification.read && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            markAsRead(notification._id);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteNotification(notification._id);
                                                    }}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
