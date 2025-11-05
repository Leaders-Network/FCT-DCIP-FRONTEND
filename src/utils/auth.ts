/**
 * Authentication utility functions
 */

export const getAuthToken = (tokenType?: 'user' | 'admin' | 'super-admin' | 'nia-admin' | 'surveyor'): string | null => {
    if (typeof window === 'undefined') return null;

    // If specific token type is requested, try to get that first
    if (tokenType) {
        const tokenKey = getTokenKeyForType(tokenType);
        const token = localStorage.getItem(tokenKey);
        if (token) {
            console.log(`Using specific auth token from: ${tokenKey}`);
            return token;
        }
    }

    // Fallback to checking all token types in priority order
    const tokenKeys = [
        'superAdminToken',  // Super admin has highest priority
        'niaAdminToken',
        'adminToken',
        'surveyorToken',
        'userToken',
        'token',           // Legacy token
        'authToken'        // Legacy token
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

const getTokenKeyForType = (tokenType: string): string => {
    switch (tokenType) {
        case 'user': return 'userToken';
        case 'admin': return 'adminToken';
        case 'super-admin': return 'superAdminToken';
        case 'nia-admin': return 'niaAdminToken';
        case 'surveyor': return 'surveyorToken';
        default: return 'token';
    }
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

export const setAuthToken = (token: string, tokenType: 'user' | 'admin' | 'super-admin' | 'nia-admin' | 'surveyor' = 'admin'): void => {
    if (typeof window === 'undefined') return;

    const tokenKey = getTokenKeyForType(tokenType);
    localStorage.setItem(tokenKey, token);
    console.log(`Auth token set for: ${tokenKey}`);
};

export const removeAuthToken = (tokenType?: 'user' | 'admin' | 'super-admin' | 'nia-admin' | 'surveyor'): void => {
    if (typeof window === 'undefined') return;

    if (tokenType) {
        // Remove specific token type
        const tokenKey = getTokenKeyForType(tokenType);
        localStorage.removeItem(tokenKey);
        console.log(`Auth token removed for: ${tokenKey}`);
    } else {
        // Remove all tokens
        const tokenKeys = [
            'superAdminToken',
            'niaAdminToken',
            'adminToken',
            'surveyorToken',
            'userToken',
            'token',
            'authToken'
        ];

        tokenKeys.forEach(key => {
            localStorage.removeItem(key);
        });

        console.log('All auth tokens removed');
    }
};

export const clearAuthTokens = (): void => {
    if (typeof window === 'undefined') return;

    const tokenKeys = [
        'superAdminToken',
        'niaAdminToken',
        'adminToken',
        'surveyorToken',
        'userToken',
        'token',
        'authToken',
        'surveyorOrganization',
        'surveyorInfo',
        'surveyorName',
        'surveyorId',
        'niaAdminInfo',
        'adminInfo',
        'userInfo',
        'superAdminInfo'
    ];

    tokenKeys.forEach(key => {
        localStorage.removeItem(key);
    });

    console.log('All auth tokens and user info cleared');
};

export const getApiHeaders = (tokenType?: 'user' | 'admin' | 'super-admin' | 'nia-admin' | 'surveyor'): Record<string, string> => {
    const token = getAuthToken(tokenType);
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

// Get current user's token type based on available tokens
export const getCurrentTokenType = (): string | null => {
    if (typeof window === 'undefined') return null;

    const tokenTypes = [
        { type: 'super-admin', key: 'superAdminToken' },
        { type: 'nia-admin', key: 'niaAdminToken' },
        { type: 'admin', key: 'adminToken' },
        { type: 'surveyor', key: 'surveyorToken' },
        { type: 'user', key: 'userToken' }
    ];

    for (const { type, key } of tokenTypes) {
        if (localStorage.getItem(key)) {
            return type;
        }
    }

    // Check legacy tokens
    if (localStorage.getItem('token') || localStorage.getItem('authToken')) {
        return 'legacy';
    }

    return null;
};

// Check if user has specific access level
export const hasAccessLevel = (requiredLevel: 'user' | 'admin' | 'super-admin' | 'nia-admin' | 'surveyor'): boolean => {
    const currentType = getCurrentTokenType();
    if (!currentType) return false;

    // Super admin has access to everything
    if (currentType === 'super-admin') return true;

    // Check specific access levels
    switch (requiredLevel) {
        case 'user':
            return ['user', 'admin', 'super-admin', 'nia-admin', 'surveyor'].includes(currentType);
        case 'admin':
            return ['admin', 'super-admin'].includes(currentType);
        case 'nia-admin':
            return ['nia-admin', 'super-admin'].includes(currentType);
        case 'surveyor':
            return ['surveyor', 'super-admin'].includes(currentType);
        case 'super-admin':
            return currentType === 'super-admin';
        default:
            return false;
    }
};

// Decode JWT token to get user info (client-side only for display purposes)
export const decodeToken = (token?: string): any => {
    if (typeof window === 'undefined') return null;

    const tokenToUse = token || getAuthToken();
    if (!tokenToUse) return null;

    try {
        const base64Url = tokenToUse.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
};