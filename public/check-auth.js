/**
 * Authentication Status Checker
 * Paste this in browser console to check your authentication status
 */

(function checkAuthStatus() {

    // Check for tokens
    const tokens = {
        user: localStorage.getItem('userToken'),
        admin: localStorage.getItem('adminToken'),
        superAdmin: localStorage.getItem('superAdminToken'),
        niaAdmin: localStorage.getItem('niaAdminToken'),
        surveyor: localStorage.getItem('surveyorToken'),
        legacy: localStorage.getItem('token') || localStorage.getItem('authToken')
    };

    let hasValidToken = false;

    // Display token status
    Object.entries(tokens).forEach(([type, token]) => {
        if (token) {
            hasValidToken = true;
            const isJWT = token.split('.').length === 3;
            const status = isJWT ? '✅ Valid JWT' : '❌ Invalid (not JWT)';

            if (isJWT) {
                try {
                    // Decode JWT payload
                    const payload = JSON.parse(atob(token.split('.')[1]));

                    // Check expiration
                    if (payload.exp) {
                        const expiryDate = new Date(payload.exp * 1000);
                        const isExpired = expiryDate < new Date();
                    }
                } catch (e) {
                }
            } else {
            }
        }
    });

    if (!hasValidToken) {
    }

    // Check user info
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
        try {
            const user = JSON.parse(userInfo);
        } catch (e) {
        }
    }

    if (hasValidToken) {
    } else {
    }
})();
