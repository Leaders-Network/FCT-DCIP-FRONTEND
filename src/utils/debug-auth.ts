/**
 * Debug utility to check authentication state
 */

export const debugAuthState = () => {
    if (typeof window === 'undefined') {
        console.log('Running on server side, no localStorage available');
        return;
    }

    console.log('=== Authentication Debug Info ===');

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

    console.log('Tokens in localStorage:');
    tokenKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            console.log(`  ${key}: ${value.substring(0, 20)}...`);
        }
    });

    console.log('\nUser info in localStorage:');
    userInfoKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
            console.log(`  ${key}: ${value}`);
        }
    });

    console.log('=== End Debug Info ===');
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

    console.log('All authentication data cleared');
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

    console.log('Test surveyor token set');
};

export const getCurrentAuthType = () => {
    if (typeof window === 'undefined') return 'server-side';

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

    return 'none';
};