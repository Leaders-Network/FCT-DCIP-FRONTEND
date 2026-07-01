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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-cyan-50/20 py-8">
            <div className="mx-auto max-w-4xl space-y-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                            <Bell className="h-8 w-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-gray-900">Notifications</h1>
                                <p className="text-sm text-gray-600">
                                    {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                                </p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white shadow-md shadow-blue-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
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
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('all')}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${filter === 'all'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-white/90 text-gray-700 border border-gray-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                            >
                                All ({notifications.length})
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-300 ${filter === 'unread'
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-white/90 text-gray-700 border border-gray-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm'
                                    }`}
                            >
                                Unread ({unreadCount})
                            </button>
                        </div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="rounded-full border border-white/70 bg-white/90 px-4 py-2 text-sm shadow-sm transition-all duration-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-12 text-center shadow-sm backdrop-blur-xl">
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
                                className={`group cursor-pointer rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${!notification.read ? 'ring-2 ring-blue-100' : ''
                                    }`}
                            >
                                <div className="flex items-start space-x-4">
                                    {/* Icon */}
                                    <div className="flex-shrink-0 rounded-2xl bg-slate-50 p-3 text-3xl transition-transform duration-300 group-hover:scale-105">
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
                                                <span className={`rounded-full border px-3 py-1 text-xs shadow-sm ${getPriorityColor(notification.priority)}`}>
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
                                                        className="rounded-full p-2 text-blue-600 transition-all duration-300 hover:bg-blue-50 hover:text-blue-800"
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
                                                    className="rounded-full p-2 text-gray-400 transition-all duration-300 hover:bg-red-50 hover:text-red-600"
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
