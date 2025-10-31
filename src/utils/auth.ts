/**
 * Authentication utility functions
 */

export const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Try different token keys in order of preference
    const tokenKeys = [
        'niaAdminToken',
        'adminToken', 
        'token',
        'authToken'
    ];
    
    for (const key of tokenKeys) {
        const token = localStorage.getItem(key);
        if (token) {
            console.log(`Using auth token from: ${key}`);
            return token;
        }
    }
    
    console.warn('No authentication token found in localStorage');
    return null;
};

export const getUserRole = (): string | null => {
    if (typeof window === 'undefined') return null;
    
    // Try to get user role from different sources
    const adminInfo = localStorage.getItem('niaAdminInfo');
    if (adminInfo) {
        try {
            const parsed = JSON.parse(adminInfo);
            return parsed.role || 'nia-admin';
        } catch (e) {
            console.warn('Failed to parse NIA admin info');
        }
    }
    
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        try {
            const parsed = JSON.parse(userInfo);
            return parsed.role || 'user';
        } catch (e) {
            console.warn('Failed to parse user info');
        }
    }
    
    return null;
};

export const isAuthenticated = (): boolean => {
    return getAuthToken() !== null;
};

export const getApiHeaders = (): Record<string, string> => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};