/**
 * Authentication utility functions
 */

import { getCookie, setCookie, deleteCookie } from './cookies';

export type TokenType = 'user' | 'admin' | 'super-admin' | 'nia-admin' | 'broker-admin' | 'surveyor';

const isBrowser = (): boolean => typeof window !== 'undefined';

const getStoredValue = (key: string): string | null => {
    if (!isBrowser()) return null;

    const cookieValue = getCookie(key);
    if (cookieValue) {
        if (window.localStorage.getItem(key) !== cookieValue) {
            window.localStorage.setItem(key, cookieValue);
        }
        return cookieValue;
    }

    return window.localStorage.getItem(key);
};

const setStoredValue = (key: string, value: string): void => {
    if (!isBrowser()) return;

    setCookie(key, value, {
        expires: 7,
        path: '/',
        secure: window.location.protocol === 'https:',
        sameSite: 'lax'
    });
    window.localStorage.setItem(key, value);
};

const removeStoredValue = (key: string): void => {
    if (!isBrowser()) return;

    deleteCookie(key);
    window.localStorage.removeItem(key);
};

const syncLegacySuperAdminTokens = (token: string): void => {
    if (!isBrowser()) return;

    if (window.localStorage.getItem('token') !== token || getCookie('token') !== token) {
        setStoredValue('token', token);
    }

    if (window.localStorage.getItem('authToken') !== token || getCookie('authToken') !== token) {
        setStoredValue('authToken', token);
    }
};

const getStoredUserRole = (): string | null => {
    if (!isBrowser()) return null;

    const userSources = ['superAdminInfo', 'user', 'adminInfo', 'niaAdminInfo', 'brokerAdminInfo', 'userInfo'];

    for (const key of userSources) {
        const rawValue = getStoredValue(key);
        if (!rawValue) continue;

        try {
            const parsed = JSON.parse(rawValue);
            const directRole = typeof parsed?.role === 'string' ? parsed.role : null;
            const employeeRole = typeof parsed?.employeeRole?.role === 'string' ? parsed.employeeRole.role : null;
            const role = directRole || employeeRole;

            if (role) {
                return role;
            }
        } catch (_error) {
            continue;
        }
    }

    return null;
};

const hasActiveSuperAdminSession = (): boolean => {
    if (!isBrowser()) return false;

    const superAdminToken = getStoredValue('superAdminToken');
    if (!superAdminToken) return false;

    const role = getStoredUserRole();
    return role === 'Super-admin' || role === 'super-admin' || role === 'Super admin' || role === 'super admin';
};

export const getAuthToken = (tokenType?: TokenType): string | null => {
    if (!isBrowser()) return null;

    const activeSuperAdminSession = hasActiveSuperAdminSession();
    const activeSuperAdminToken = activeSuperAdminSession ? getStoredValue('superAdminToken') : null;

    // If specific token type is requested, try to get that specific token first
    if (tokenType) {
        if (tokenType !== 'super-admin' && activeSuperAdminToken) {
            syncLegacySuperAdminTokens(activeSuperAdminToken);
            return activeSuperAdminToken;
        }

        const tokenKey = getTokenKeyForType(tokenType);
        const token = getStoredValue(tokenKey);
        if (token) {
            if (tokenType === 'super-admin') {
                syncLegacySuperAdminTokens(token);
            }
            return token;
        }

        // Super admin can satisfy any lower-level dashboard request.
        if (tokenType !== 'super-admin') {
            const superAdminToken = getStoredValue('superAdminToken');
            if (superAdminToken) {
                syncLegacySuperAdminTokens(superAdminToken);
                return superAdminToken;
            }
        }
    }

    // Auto-detect token type based on current URL path
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

    // If we detected a type from the URL, try to get that specific token
    if (detectedType) {
        if (detectedType !== 'super-admin' && activeSuperAdminToken) {
            syncLegacySuperAdminTokens(activeSuperAdminToken);
            return activeSuperAdminToken;
        }

        const tokenKey = getTokenKeyForType(detectedType);
        const token = getStoredValue(tokenKey);
        if (token) {
            if (detectedType === 'super-admin') {
                syncLegacySuperAdminTokens(token);
            }
            return token;
        }

        if (detectedType !== 'super-admin') {
            const superAdminToken = getStoredValue('superAdminToken');
            if (superAdminToken) {
                syncLegacySuperAdminTokens(superAdminToken);
                return superAdminToken;
            }
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
        const token = getStoredValue(key);
        if (token) {
            if (key === 'superAdminToken') {
                syncLegacySuperAdminTokens(token);
            }
            return token;
        }
    }
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
    const adminInfo = getCookie('niaAdminInfo');
    if (adminInfo) {
        try {
            const parsed = JSON.parse(adminInfo);
            return parsed.role || 'nia-admin';
        } catch (e) {
        }
    }

    const userInfo = getCookie('userInfo');
    if (userInfo) {
        try {
            const parsed = JSON.parse(userInfo);
            return parsed.role || 'user';
        } catch (e) {
        }
    }

    return null;
};

export const isAuthenticated = (): boolean => {
    return getAuthToken() !== null;
};

export const setAuthToken = (token: string, tokenType: TokenType = 'admin'): void => {
    if (!isBrowser()) return;

    const tokenKey = getTokenKeyForType(tokenType);
    setStoredValue(tokenKey, token);

    // Legacy tokens are still used in a few older screens.
    if (tokenType === 'super-admin') {
        setStoredValue('token', token);
        setStoredValue('authToken', token);
    }
};

export const removeAuthToken = (tokenType?: TokenType): void => {
    if (!isBrowser()) return;

    if (tokenType) {
        // Remove specific token type
        const tokenKey = getTokenKeyForType(tokenType);
        removeStoredValue(tokenKey);

        if (tokenType === 'super-admin') {
            removeStoredValue('token');
            removeStoredValue('authToken');
        }
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
            removeStoredValue(key);
        });
    }
};

export const clearAuthTokens = (): void => {
    if (!isBrowser()) return;

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
        removeStoredValue(key);
    });
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
    if (!isBrowser()) return null;

    const activeSuperAdminSession = hasActiveSuperAdminSession();

    // First, try to detect from current URL path
    const currentPath = window.location.pathname;

    if (currentPath.includes('/broker-admin')) {
        if (getStoredValue('brokerAdminToken')) return 'broker-admin';
    } else if (currentPath.includes('/nia-admin')) {
        if (getStoredValue('niaAdminToken')) return 'nia-admin';
    } else if (currentPath.includes('/surveyor')) {
        if (getStoredValue('surveyorToken')) return 'surveyor';
    } else if (currentPath.includes('/admin') && !currentPath.includes('/nia-admin') && !currentPath.includes('/broker-admin')) {
        if (activeSuperAdminSession) return 'super-admin';
        if (getStoredValue('adminToken')) return 'admin';
    } else if (currentPath.includes('/super-admin')) {
        if (getStoredValue('superAdminToken')) return 'super-admin';
    } else if (currentPath.includes('/dashboard') || currentPath.includes('/user')) {
        if (getStoredValue('userToken')) return 'user';
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
        if (getStoredValue(key)) {
            return type;
        }
    }

    // Check legacy tokens
    if (getStoredValue('token') || getStoredValue('authToken')) {
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
        return null;
    }
};
