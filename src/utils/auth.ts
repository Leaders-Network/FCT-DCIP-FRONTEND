/**
 * Authentication utility functions
 */

export type TokenType = 'user' | 'admin' | 'super-admin' | 'nia-admin' | 'broker-admin' | 'surveyor';

export const getAuthToken = (tokenType?: TokenType): string | null => {
    if (typeof window === 'undefined') return null;

    // If specific token type is requested, ONLY try to get that specific token
    // Do NOT fallback to other token types to avoid token type confusion
    if (tokenType) {
        const tokenKey = getTokenKeyForType(tokenType);
        const token = localStorage.getItem(tokenKey);
        if (token) {
            console.log(`Using specific auth token from: ${tokenKey}`);
            return token;
        }
        // If specific token type requested but not found, return null
        // This prevents using wrong token type (e.g., surveyor token for admin endpoints)
        console.warn(`Requested token type '${tokenType}' not found in localStorage`);
        return null;
    }

    // Auto-detect token type based on current URL path when no specific type is requested
    const currentPath = window.location.pathname;
    let detectedType: TokenType | null = null;

    if (currentPath.includes('/broker-admin')) {
        detectedType = 'broker-admin';
    } else if (currentPath.includes('/nia-admin')) {
        detectedType = 'nia-admin';
    } else if (currentPath.includes('/surveyor')) {
        detectedType = 'surveyor';
    } else if (currentPath.includes('/admin') && !currentPath.includes('/nia-admin') && !currentPath.includes('/broker-admin')) {
        detectedType = 'admin';
    } else if (currentPath.includes('/super-admin')) {
        detectedType = 'super-admin';
    } else if (currentPath.includes('/dashboard') || currentPath.includes('/user')) {
        detectedType = 'user';
    }

    // If we detected a type from the URL, try to get that specific token first
    if (detectedType) {
        const tokenKey = getTokenKeyForType(detectedType);
        const token = localStorage.getItem(tokenKey);
        if (token) {
            console.log(`Auto-detected and using auth token from: ${tokenKey} (based on path: ${currentPath})`);
            return token;
        }
    }

    // Fallback to checking all token types in priority order
    const tokenKeys = [
        'superAdminToken',  // Super admin has highest priority
        'niaAdminToken',
        'brokerAdminToken',
        'adminToken',
        'surveyorToken',
        'userToken',
        'token',           // Legacy token
        'authToken'        // Legacy token
    ];

    for (const key of tokenKeys) {
        const token = localStorage.getItem(key);
        if (token) {
            console.log(`Using fallback auth token from: ${key}`);
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
        case 'broker-admin': return 'brokerAdminToken';
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

export const setAuthToken = (token: string, tokenType: TokenType = 'admin'): void => {
    if (typeof window === 'undefined') return;

    const tokenKey = getTokenKeyForType(tokenType);
    localStorage.setItem(tokenKey, token);
    console.log(`Auth token set for: ${tokenKey}`);
};

export const removeAuthToken = (tokenType?: TokenType): void => {
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
            'brokerAdminToken',
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
        'brokerAdminToken',
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
        'brokerAdminInfo',
        'adminInfo',
        'userInfo',
        'superAdminInfo'
    ];

    tokenKeys.forEach(key => {
        localStorage.removeItem(key);
    });

    console.log('All auth tokens and user info cleared');
};

export const getApiHeaders = (tokenType?: TokenType): Record<string, string> => {
    const token = getAuthToken(tokenType);
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

// Get current user's token type based on URL path and available tokens
export const getCurrentTokenType = (): string | null => {
    if (typeof window === 'undefined') return null;

    // First, try to detect from current URL path
    const currentPath = window.location.pathname;

    if (currentPath.includes('/broker-admin')) {
        if (localStorage.getItem('brokerAdminToken')) return 'broker-admin';
    } else if (currentPath.includes('/nia-admin')) {
        if (localStorage.getItem('niaAdminToken')) return 'nia-admin';
    } else if (currentPath.includes('/surveyor')) {
        if (localStorage.getItem('surveyorToken')) return 'surveyor';
    } else if (currentPath.includes('/admin') && !currentPath.includes('/nia-admin') && !currentPath.includes('/broker-admin')) {
        if (localStorage.getItem('adminToken')) return 'admin';
    } else if (currentPath.includes('/super-admin')) {
        if (localStorage.getItem('superAdminToken')) return 'super-admin';
    } else if (currentPath.includes('/dashboard') || currentPath.includes('/user')) {
        if (localStorage.getItem('userToken')) return 'user';
    }

    // Fallback: check all token types in priority order
    const tokenTypes = [
        { type: 'super-admin', key: 'superAdminToken' },
        { type: 'nia-admin', key: 'niaAdminToken' },
        { type: 'broker-admin', key: 'brokerAdminToken' },
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
export const hasAccessLevel = (requiredLevel: TokenType): boolean => {
    const currentType = getCurrentTokenType();
    if (!currentType) return false;

    // Super admin has access to everything
    if (currentType === 'super-admin') return true;

    // Check specific access levels
    switch (requiredLevel) {
        case 'user':
            return ['user', 'admin', 'super-admin', 'nia-admin', 'broker-admin', 'surveyor'].includes(currentType);
        case 'admin':
            return ['admin', 'super-admin'].includes(currentType);
        case 'nia-admin':
            return ['nia-admin', 'super-admin'].includes(currentType);
        case 'broker-admin':
            return ['broker-admin', 'super-admin'].includes(currentType);
        case 'surveyor':
            return ['surveyor', 'super-admin'].includes(currentType);
        case 'super-admin':
            return currentType === 'super-admin';
        default:
            return false;
    }
};

// Decode JWT token to get user info (client-side only for display purposes)
export const decodeToken = (token?: string): Record<string, unknown> | null => {
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
