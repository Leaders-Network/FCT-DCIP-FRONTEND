import { 
  PolicyRequest, 
  Surveyor, 
  Assignment, 
  PolicyAssignment, 
  SurveySubmission 
} from '@/types/api.types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://fct-dcip-backend.vercel.app/api/v1';
const API_KEY = "4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c";

// Helper function for consistent token retrieval
const getAuthToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("authToken");
};

// Helper function for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'apiKey': API_KEY,
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'API request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Admin API Service
export const adminApi = {
  // Dashboard Stats
  getDashboardStats: async () => {
    return apiCall('/admin/dashboard/stats');
  },

  getRecentActivity: async () => {
    return apiCall('/admin/dashboard/activity');
  },

  // Policy Management
  getPolicies: async (filters?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/admin/policy${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiCall(endpoint);
  },

  getAdminProperties: async () => {
    return apiCall('/admin/property');
  },

  assignSurveyorToPolicy: async (assignment: PolicyAssignment) => {
    return apiCall('/surveyor/assign', {
      method: 'POST',
      body: JSON.stringify(assignment),
    });
  },

  reviewPolicySubmission: async (policyId: string, decision: 'approved' | 'rejected', notes: string) => {
    return apiCall(`/policy/${policyId}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes }),
    });
  },

  sendPolicyToUser: async (policyId: string) => {
    return apiCall(`/admin/policy/${policyId}/send-to-user`, {
      method: 'POST',
    });
  },

  getAdministrators: async () => {
    return apiCall('/admin/administrators');
  },

  createAdministrator: async (adminData: any) => {
    return apiCall('/admin/administrators', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
  },

  // Surveyor Management
  getSurveyors: async (filters?: {
    status?: string;
    specialization?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/admin/surveyor${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiCall(endpoint);
  },

  createSurveyor: async (surveyorData: Partial<Surveyor>) => {
    return apiCall('/admin/surveyor', {
      method: 'POST',
      body: JSON.stringify(surveyorData),
    });
  },

  updateSurveyor: async (surveyorId: string, surveyorData: Partial<Surveyor>) => {
    return apiCall(`/admin/surveyor/${surveyorId}`, {
      method: 'PATCH',
      body: JSON.stringify(surveyorData),
    });
  },

  deleteSurveyor: async (surveyorId: string) => {
    return apiCall(`/admin/surveyor/${surveyorId}`, {
      method: 'DELETE',
    });
  },

  getSurveyorById: async (surveyorId: string) => {
    return apiCall(`/admin/surveyor/${surveyorId}`);
  },

  getSurveyorPerformance: async (surveyorId: string) => {
    return apiCall(`/admin/surveyor/${surveyorId}/performance`);
  },

  // Assignment Management
  getAssignments: async (filters?: {
    status?: string;
    priority?: string;
    surveyorId?: string;
    overdue?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/admin/assignment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiCall(endpoint);
  },

  createAssignment: async (assignmentData: Partial<Assignment>) => {
    return apiCall('/admin/assignment', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  },

  updateAssignment: async (assignmentId: string, assignmentData: Partial<Assignment>) => {
    return apiCall(`/admin/assignment/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  },

  reassignSurveyor: async (assignmentId: string, newSurveyorId: string, reason?: string) => {
    return apiCall(`/admin/assignment/${assignmentId}/reassign`, {
      method: 'POST',
      body: JSON.stringify({ surveyorId: newSurveyorId, reason }),
    });
  },

  getAssignmentById: async (assignmentId: string) => {
    return apiCall(`/admin/assignment/${assignmentId}`);
  },

  // Survey Submissions
  getSurveySubmissions: async (filters?: {
    status?: string;
    surveyorId?: string;
    policyId?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/submission${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiCall(endpoint);
  },

  approveSurveySubmission: async (submissionId: string, notes?: string) => {
    return apiCall(`/submission/${submissionId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  rejectSurveySubmission: async (submissionId: string, reason: string) => {
    return apiCall(`/submission/${submissionId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  getSurveyDocumentDownloadUrl: async (publicId: string) => {
    return apiCall(`/survey-documents/download/${publicId}`);
  },

  // File Management
  uploadFile: async (file: File, type: string, relatedId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('relatedId', relatedId);

    return apiCall('/files/upload', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  },

  downloadFile: async (fileId: string) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/files/download/${fileId}`, {
      headers: {
        'apiKey': API_KEY,
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to download file');
    }

    return response;
  },

  // Analytics and Reports
  getAnalytics: async (period: 'week' | 'month' | 'quarter' | 'year') => {
    return apiCall(`/admin/analytics?period=${period}`);
  },

  generateReport: async (reportType: string, filters?: any) => {
    return apiCall('/admin/reports', {
      method: 'POST',
      body: JSON.stringify({ type: reportType, filters }),
    });
  },

  // Notifications
  getNotifications: async (unreadOnly?: boolean) => {
    const endpoint = `/notifications${unreadOnly ? '?unread=true' : ''}`;
    return apiCall(endpoint);
  },

  markNotificationAsRead: async (notificationId: string) => {
    return apiCall(`/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  },

  // Utility functions
  searchAll: async (query: string) => {
    return apiCall(`/search?q=${encodeURIComponent(query)}`);
  },

  getSystemHealth: async () => {
    return apiCall('/system/health');
  },
};

// Error handling wrapper for UI components
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  onError?: (error: Error) => void
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error('API Error:', err);
      
      if (onError) {
        onError(err);
      } else {
        // Default error handling - you can customize this
        alert(`Error: ${err.message}`);
      }
      
      throw err;
    }
  }) as T;
};

export default adminApi;