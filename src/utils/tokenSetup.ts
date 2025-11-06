/**
 * Token setup utility for development and testing
 * This file sets up authentication tokens for different user types
 */

// Development tokens - these would be replaced with actual tokens in production
const DEVELOPMENT_TOKENS = {
    niaAdmin: 'dev-nia-admin-token-12345',
    ammcAdmin: 'dev-ammc-admin-token-12345',
    superAdmin: 'dev-super-admin-token-12345',
    surveyor: 'dev-surveyor-token-12345',
    user: 'dev-user-token-12345'
};

/**
 * Set up development tokens for testing
 */
export const setupDevelopmentTokens = (): void => {
    if (typeof window === 'undefined') return;

    // Only set up tokens in development mode
    if (process.env.NODE_ENV === 'development') {
        // Set NIA Admin token
        if (!localStorage.getItem('niaAdminToken')) {
            localStorage.setItem('niaAdminToken', DEVELOPMENT_TOKENS.niaAdmin);
            console.log('🔧 Development NIA Admin token set');
        }

        // Set AMMC Admin token
        if (!localStorage.getItem('adminToken')) {
            localStorage.setItem('adminToken', DEVELOPMENT_TOKENS.ammcAdmin);
            console.log('🔧 Development AMMC Admin token set');
        }

        // Set Super Admin token
        if (!localStorage.getItem('superAdminToken')) {
            localStorage.setItem('superAdminToken', DEVELOPMENT_TOKENS.superAdmin);
            console.log('🔧 Development Super Admin token set');
        }

        // Set Surveyor token
        if (!localStorage.getItem('surveyorToken')) {
            localStorage.setItem('surveyorToken', DEVELOPMENT_TOKENS.surveyor);
            console.log('🔧 Development Surveyor token set');
        }

        // Set User token
        if (!localStorage.getItem('userToken')) {
            localStorage.setItem('userToken', DEVELOPMENT_TOKENS.user);
            console.log('🔧 Development User token set');
        }
    }
};

/**
 * Clear all development tokens
 */
export const clearDevelopmentTokens = (): void => {
    if (typeof window === 'undefined') return;

    const tokenKeys = [
        'niaAdminToken',
        'adminToken',
        'superAdminToken',
        'surveyorToken',
        'userToken',
        'token',
        'authToken'
    ];

    tokenKeys.forEach(key => {
        localStorage.removeItem(key);
    });

    console.log('🧹 All development tokens cleared');
};

/**
 * Get current token status
 */
export const getTokenStatus = (): Record<string, boolean> => {
    if (typeof window === 'undefined') return {};

    return {
        niaAdmin: !!localStorage.getItem('niaAdminToken'),
        ammcAdmin: !!localStorage.getItem('adminToken'),
        superAdmin: !!localStorage.getItem('superAdminToken'),
        surveyor: !!localStorage.getItem('surveyorToken'),
        user: !!localStorage.getItem('userToken'),
        legacy: !!(localStorage.getItem('token') || localStorage.getItem('authToken'))
    };
};

// Auto-setup tokens in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    setupDevelopmentTokens();
}