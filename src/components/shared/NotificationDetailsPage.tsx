'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bell, Calendar, CheckCircle2, Clock, Flag, Trash2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useNotifications } from '@/context/NotificationContext';
import { notificationApi } from '@/services/notificationApi';
import { Notification } from '@/types/notification.types';

interface NotificationDetailsPageProps {
    notificationId: string;
}

const formatDateTime = (value?: string) => {
    if (!value) return 'Not available';
    return new Date(value).toLocaleString();
};

const labelize = (value: string) =>
    value
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^./, (char) => char.toUpperCase());

const renderValue = (value: unknown) => {
    if (value === null || value === undefined || value === '') return 'Not available';
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return JSON.stringify(value, null, 2);
};

const DetailGrid: React.FC<{ title: string; entries?: Record<string, unknown> }> = ({ title, entries }) => {
    const rows = Object.entries(entries || {}).filter(([, value]) => value !== undefined && value !== null && value !== '');

    if (rows.length === 0) return null;

    return (
        <section className="bg-white border border-gray-200 rounded-lg p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">{title}</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {rows.map(([key, value]) => (
                    <div key={key} className="min-w-0">
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{labelize(key)}</dt>
                        <dd className="mt-1 text-sm text-gray-900 break-words whitespace-pre-wrap">{renderValue(value)}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
};

const NotificationDetailsPage: React.FC<NotificationDetailsPageProps> = ({ notificationId }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { notifications, markAsRead, deleteNotification, fetchNotifications } = useNotifications();
    const [notification, setNotification] = useState<Notification | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const notificationsPath = pathname?.startsWith('/admin/dashboard')
        ? '/admin/dashboard/notifications'
        : pathname?.startsWith('/broker-admin')
            ? '/broker-admin/notifications'
            : pathname?.startsWith('/nia-admin')
                ? '/nia-admin/notifications'
                : pathname?.startsWith('/surveyor/dashboard')
                    ? '/surveyor/dashboard/notifications'
                    : '/dashboard/notifications';

    const cachedNotification = useMemo(
        () => notifications.find((item) => item._id === notificationId),
        [notificationId, notifications]
    );

    useEffect(() => {
        let cancelled = false;

        const loadNotification = async () => {
            setLoading(true);
            setNotFound(false);

            try {
                if (cachedNotification) {
                    if (!cancelled) setNotification(cachedNotification);
                    return;
                }

                const response = await notificationApi.getNotification(notificationId);
                if (!cancelled && response.success) {
                    setNotification(response.notification);
                }
            } catch (error) {
                if (!cancelled) setNotFound(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadNotification();

        return () => {
            cancelled = true;
        };
    }, [cachedNotification, notificationId]);

    useEffect(() => {
        if (notification && !notification.read) {
            markAsRead(notification._id);
            setNotification((current) =>
                current ? { ...current, read: true, readAt: current.readAt || new Date().toISOString() } : current
            );
        }
    }, [markAsRead, notification]);

    const handleDelete = async () => {
        await deleteNotification(notificationId);
        router.push(notificationsPath);
    };

    const handleRefresh = async () => {
        await fetchNotifications();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (notFound || !notification) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <button
                        onClick={() => router.push(notificationsPath)}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to notifications
                    </button>
                    <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
                        <Bell className="h-14 w-14 mx-auto text-gray-300 mb-4" />
                        <h1 className="text-xl font-semibold text-gray-900 mb-2">Notification not found</h1>
                        <p className="text-gray-600 mb-5">This notification may have been deleted or is no longer available.</p>
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                        >
                            Refresh notifications
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
                <button
                    onClick={() => router.push(notificationsPath)}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to notifications
                </button>

                <article className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                    {labelize(notification.type)}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                    <Flag className="h-3 w-3 mr-1" />
                                    {labelize(notification.priority)}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    {notification.read ? 'Read' : 'Unread'}
                                </span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 break-words">{notification.title}</h1>
                            <p className="mt-4 text-base leading-7 text-gray-700 whitespace-pre-wrap">{notification.message}</p>
                        </div>

                        <div className="flex flex-wrap gap-2 sm:justify-end">
                            <button
                                onClick={handleDelete}
                                className="inline-flex items-center px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </button>
                        </div>
                    </div>
                </article>

                <section className="bg-white border border-gray-200 rounded-lg p-5">
                    <h2 className="text-sm font-semibold text-gray-900 mb-4">Timeline</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start">
                            <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Received</p>
                                <p className="text-sm text-gray-900">{formatDateTime(notification.createdAt)}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Read</p>
                                <p className="text-sm text-gray-900">{formatDateTime(notification.readAt)}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <DetailGrid title="Additional Data" entries={notification.data} />
            </div>
        </div>
    );
};

export default NotificationDetailsPage;
