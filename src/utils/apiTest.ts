/**
 * API Test utility for debugging connection issues
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://fct-dcip-backend.vercel.app/api/v1";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c";

export const testApiConnection = async () => {
    console.log('=== API CONNECTION TEST ===');
    console.log('API Base URL:', API_BASE_URL);
    console.log('API Key (first 20 chars):', API_KEY ? API_KEY.substring(0, 20) + '...' : 'Missing');
    console.log('API Key (full):', API_KEY);

    try {
        // Test basic connection
        const response = await fetch(`${API_BASE_URL}/auth/available-categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY
            }
        });

        console.log('Response Status:', response.status);
        console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const data = await response.json();
            console.log('✅ API Connection successful');
            console.log('Response data:', data);
        } else {
            const errorText = await response.text();
            console.log('❌ API Connection failed');
            console.log('Error response:', errorText);

            // Test with different API key formats
            console.log('Testing different API key formats...');
            await testDifferentApiKeyFormats();
        }

    } catch (error) {
        console.log('❌ Network error:', error);
    }

    console.log('=========================');
};

const testDifferentApiKeyFormats = async () => {
    const testKeys = [
        // Try without spaces
        API_KEY.trim(),
        // Try with different header names
        API_KEY
    ];

    const headerNames = ['apikey', 'apiKey', 'API_KEY', 'x-api-key'];

    for (const headerName of headerNames) {
        for (const key of testKeys) {
            try {
                console.log(`Testing with header: ${headerName}, key: ${key.substring(0, 20)}...`);

                const response = await fetch(`${API_BASE_URL}/auth/available-categories`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        [headerName]: key
                    }
                });

                if (response.ok) {
                    console.log(`✅ SUCCESS with header: ${headerName}`);
                    return;
                } else {
                    const errorText = await response.text();
                    console.log(`❌ Failed with ${headerName}: ${errorText}`);
                }
            } catch (error) {
                console.log(`❌ Error with ${headerName}:`, error);
            }
        }
    }
};

export const testLogin = async (email: string, password: string) => {
    console.log('=== LOGIN TEST ===');
    console.log('Email:', email);
    console.log('API Base URL:', API_BASE_URL);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/loginEmployee`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': API_KEY
            },
            body: JSON.stringify({ email, password })
        });

        console.log('Login Response Status:', response.status);

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Login successful');
            console.log('Login data:', data);
            return data;
        } else {
            const errorText = await response.text();
            console.log('❌ Login failed');
            console.log('Error response:', errorText);
            return null;
        }

    } catch (error) {
        console.log('❌ Login network error:', error);
        return null;
    }
};

export const testBackendReachability = async () => {
    console.log('=== BACKEND REACHABILITY TEST ===');

    try {
        // Test if backend is reachable at all (without API key)
        const response = await fetch(`${API_BASE_URL}/auth/available-categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
                // No API key to see what error we get
            }
        });

        console.log('Response Status:', response.status);
        const responseText = await response.text();
        console.log('Response Text:', responseText);

        if (response.status === 401 && responseText.includes('No ApiKey Provided')) {
            console.log('✅ Backend is reachable - API key validation is working');
            console.log('❌ But our API key is not being accepted');
        } else {
            console.log('Backend response:', responseText);
        }

    } catch (error) {
        console.log('❌ Backend not reachable:', error);
    }

    console.log('================================');
};

// Auto-run connection test in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Run test after a short delay to ensure DOM is ready
    setTimeout(() => {
        testBackendReachability();
        testApiConnection();
    }, 1000);
}