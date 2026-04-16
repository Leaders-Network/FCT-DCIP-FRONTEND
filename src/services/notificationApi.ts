import axios from 'axios';
import { Notification, NotificationResponse, UnreadCountResponse } from '@/types/notification.types';
import { getAuthToken } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'apikey': API_KEY,
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = getAuthToken();
    console.log('🔔 Notification API request:', config.url, 'Token:', token ? 'Present' : 'Missing');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log('🔔 Notification API response:', response.config.url, response.status, response.data);
        return response;
    },
    (error) => {
        console.error('❌ Notification API error:', error.config?.url, error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export const notificationApi = {
    // Get notifications
    getNotifications: async (params?: {
        page?: number;
        limit?: number;
        unreadOnly?: boolean;
    }): Promise<NotificationResponse> => {
        const response = await api.get('/notifications', { params });
        return response.data;
    },

    // Get unread count
    getUnreadCount: async (): Promise<UnreadCountResponse> => {
        const response = await api.get('/notifications/unread-count');
        return response.data;
    },

    // Get a single notification
    getNotification: async (id: string): Promise<{ success: boolean; notification: Notification }> => {
        const response = await api.get(`/notifications/${id}`);
        return response.data;
    },

    // Mark as read
    markAsRead: async (id: string): Promise<{ success: boolean }> => {
        const response = await api.patch(`/notifications/${id}/read`);
        return response.data;
    },

    // Mark all as read
    markAllAsRead: async (): Promise<{ success: boolean }> => {
        const response = await api.patch('/notifications/mark-all-read');
        return response.data;
    },

    // Delete notification
    deleteNotification: async (id: string): Promise<{ success: boolean }> => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    },
};
