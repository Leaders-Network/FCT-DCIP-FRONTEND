/**
 * Debug utility to check authentication state
 */

export const debugAuthState = () => {
    if (typeof window === 'undefined') {
        return;
    }

    const tokenKeys = [
        'superAdminToken',
        'niaAdminToken',
        'adminToken',
        'surveyorToken',
        'userToken',
        'token',
        'authToken'
    ];

    const userInfoKeys = [
        'surveyorName',
        'surveyorId',
        'surveyorOrganization',
        'surveyorInfo',
        'userRole',
        'niaAdminInfo',
        'adminInfo',
        'userInfo'
    ];
    tokenKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
        }
    });
    userInfoKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
        }
    });
};

export const clearAllAuthData = () => {
    if (typeof window === 'undefined') return;

    const allKeys = [
        'superAdminToken',
        'niaAdminToken',
        'adminToken',
        'surveyorToken',
        'userToken',
        'token',
        'authToken',
        'surveyorName',
        'surveyorId',
        'surveyorOrganization',
        'surveyorInfo',
        'userRole',
        'niaAdminInfo',
        'adminInfo',
        'userInfo',
        'superAdminInfo'
    ];

    allKeys.forEach(key => {
        localStorage.removeItem(key);
    });
};

export const setSurveyorTestToken = () => {
    if (typeof window === 'undefined') return;

    // Clear all existing tokens first
    clearAllAuthData();

    // Set a test surveyor token (you'll need to replace this with a real token)
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.surveyor.token';

    localStorage.setItem('surveyorToken', testToken);
    localStorage.setItem('surveyorName', 'Test Surveyor');
    localStorage.setItem('surveyorOrganization', 'AMMC');
    localStorage.setItem('userRole', 'Surveyor');
};

export type AuthType = 'super-admin' | 'nia-admin' | 'admin' | 'surveyor' | 'user' | 'legacy' | 'none' | 'server-side';

export const getCurrentAuthType = (): AuthType => {
    if (typeof window === 'undefined') return 'server-side';

    const tokenTypes: Array<{ type: Exclude<AuthType, 'legacy' | 'none' | 'server-side'>; key: string }> = [
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

    return 'none';
};