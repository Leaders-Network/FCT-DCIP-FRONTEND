'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Notification, NotificationResponse } from '@/types/notification.types';
import { notificationApi } from '@/services/notificationApi';

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
    refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const response = await notificationApi.getNotifications({ limit: 50 });
            if (response.success) {
                setNotifications(response.notifications);
                setUnreadCount(response.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshUnreadCount = useCallback(async () => {
        try {
            const response = await notificationApi.getUnreadCount();
            if (response.success) {
                setUnreadCount(response.count);
            }
        } catch (error) {
            console.error('Failed to refresh unread count:', error);
        }
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => (n._id === id ? { ...n, read: true, readAt: new Date().toISOString() } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true, readAt: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    }, []);

    const deleteNotification = useCallback(async (id: string) => {
        try {
            await notificationApi.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n._id !== id));
            // Refresh unread count in case deleted notification was unread
            await refreshUnreadCount();
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    }, [refreshUnreadCount]);

    // Initial fetch
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            refreshUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, [refreshUnreadCount]);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                fetchNotifications,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                refreshUnreadCount
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationProvider');
    }
    return context;
};
