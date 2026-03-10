import axios from 'axios';
import { API_CONFIG } from '@/constants';

const API_BASE_URL = API_CONFIG.BASE_URL;
const API_KEY = API_CONFIG.API_KEY;

import { getCookie } from '@/utils/cookies';

// Create axios instance with authentication
const createAuthenticatedRequest = () => {
  const token = getCookie('token') || getCookie('adminToken') || getCookie('userToken');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'x-api-key': API_KEY,
    },
  });
};

// Upload file to backend (which handles Cloudinary upload)
export const uploadFile = async (file: File, folder: string = 'survey-documents') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const api = createAuthenticatedRequest();
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

// Get download URL from backend
export const getFileDownloadUrl = async (publicId: string) => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.get(`/files/download-url/${publicId}`);
    return response.data;
  } catch (error) {
    console.error('Get download URL error:', error);
    throw error;
  }
};

// Download file through backend proxy
export const downloadFile = async (publicId: string, fileName?: string) => {
  try {
    const api = createAuthenticatedRequest();
    const response = await api.get(`/files/download/${publicId}`, {
      params: { fileName },
      responseType: 'blob',
    });

    // Create blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    console.error('File download error:', error);
    throw error;
  }
};

// Helper function to convert file to base64 (for preview purposes)
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
};
