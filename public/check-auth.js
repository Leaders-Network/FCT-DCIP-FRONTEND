/**
 * Authentication Status Checker
 * Paste this in browser console to check your authentication status
 */

(function checkAuthStatus() {
    console.log('\n' + '='.repeat(80));
    console.log('🔐 AUTHENTICATION STATUS CHECK');
    console.log('='.repeat(80) + '\n');

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
            console.log(`${type.toUpperCase()}: ${status}`);

            if (isJWT) {
                try {
                    // Decode JWT payload
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    console.log(`   User ID: ${payload.userId}`);
                    console.log(`   Model: ${payload.model}`);
                    console.log(`   Role: ${payload.role || 'N/A'}`);

                    // Check expiration
                    if (payload.exp) {
                        const expiryDate = new Date(payload.exp * 1000);
                        const isExpired = expiryDate < new Date();
                        console.log(`   Expires: ${expiryDate.toLocaleString()} ${isExpired ? '❌ EXPIRED' : '✅ Valid'}`);
                    }
                } catch (e) {
                    console.log(`   ⚠️ Could not decode token`);
                }
            } else {
                console.log(`   ⚠️ This is a fake token - please generate a valid one`);
            }
            console.log('');
        }
    });

    if (!hasValidToken) {
        console.log('❌ NO TOKENS FOUND\n');
        console.log('To fix this:');
        console.log('1. Run: cd FCT-DCIP-BACKEND && npm run generate-tokens');
        console.log('2. Copy the localStorage command from output');
        console.log('3. Paste it here and press Enter');
        console.log('4. Refresh the page\n');
        console.log('OR login with: testuser@example.com / password123\n');
    }

    // Check user info
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
        try {
            const user = JSON.parse(userInfo);
            console.log('👤 USER INFO:');
            console.log(`   Name: ${user.fullname || user.firstname + ' ' + user.lastname}`);
            console.log(`   Email: ${user.email}`);
            console.log('');
        } catch (e) {
            console.log('⚠️ User info found but could not parse\n');
        }
    }

    console.log('='.repeat(80));

    if (hasValidToken) {
        console.log('✅ Authentication looks good!');
    } else {
        console.log('❌ Authentication needs to be set up');
    }

    console.log('='.repeat(80) + '\n');
})();
