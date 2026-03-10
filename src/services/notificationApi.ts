import axios from 'axios';
import { API_CONFIG } from '@/constants';
import { NotificationResponse, UnreadCountResponse } from '@/types/notification.types';
import { getAuthToken } from '@/utils/auth';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    apikey: API_CONFIG.API_KEY,
  },
});

api.interceptors.request.use((config) => {
  // Ensure API key is always present (lowercase to match backend middleware)
  config.headers.apikey = API_CONFIG.API_KEY;

  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const notificationApi = {
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationResponse> => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    const response = await api.patch('/notifications/mark-all-read');
    return response.data;
  },

  deleteNotification: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

