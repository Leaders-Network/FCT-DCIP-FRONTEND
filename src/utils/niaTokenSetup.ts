/**
 * NIA Admin Token Setup Utility
 * This utility helps set up the correct token for NIA admin access
 */

import { setAuthToken } from './auth';

// NIA Admin login credentials
const NIA_ADMIN_CREDENTIALS = {
    email: 'admin@nia.org.ng',
    password: 'NIAAdmin@123'
};

export const setupNIAAdminToken = async () => {
    try {
        console.log('Setting up NIA admin token...');

        // Login as NIA admin to get the correct token
        const response = await fetch('http://localhost:5000/api/v1/auth/loginEmployee', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.NEXT_PUBLIC_API_KEY || '4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c'
            },
            body: JSON.stringify(NIA_ADMIN_CREDENTIALS)
        });

        if (!response.ok) {
            throw new Error(`Login failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.token) {
            // Set the token as niaAdminToken
            setAuthToken(data.token, 'niaAdmin');

            // Also store NIA admin info
            if (data.employee) {
                localStorage.setItem('niaAdminInfo', JSON.stringify(data.employee));
            }

            console.log('✅ NIA admin token set successfully');
            return data.token;
        } else {
            throw new Error('Login response invalid');
        }
    } catch (error) {
        console.error('❌ Failed to setup NIA admin token:', error);
        throw error;
    }
};

// Auto-setup function that can be called on page load
export const autoSetupNIAToken = async () => {
    // Check if we already have a valid NIA admin token
    const existingToken = localStorage.getItem('niaAdminToken');
    if (existingToken) {
        console.log('NIA admin token already exists');
        return existingToken;
    }

    // If no token, try to set one up
    return await setupNIAAdminToken();
};