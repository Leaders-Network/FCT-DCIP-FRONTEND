// Test utility for NIA admin login
export const testNIAAdminLogin = async () => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
        const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';

        console.log('Testing NIA Admin Login...');
        console.log('API Base URL:', baseUrl);
        console.log('API Key:', apiKey ? 'Present' : 'Missing');

        const response = await fetch(`${baseUrl}/auth/loginEmployee`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey,
            },
            body: JSON.stringify({
                email: 'admin@nia.org.ng',
                password: 'NIAAdmin@123'
            }),
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const data = await response.json();
            console.log('Login Response:', data);

            if (data.success) {
                console.log('✅ Login successful!');
                console.log('Employee Info:', data.employee);
                console.log('Role:', data.employee?.employeeRole?.role);
                console.log('Organization:', data.employee?.organization);
                return { success: true, data };
            } else {
                console.log('❌ Login failed:', data.message);
                return { success: false, error: data.message };
            }
        } else {
            const errorText = await response.text();
            console.log('❌ HTTP Error:', response.status, errorText);
            return { success: false, error: errorText, status: response.status };
        }
    } catch (error) {
        console.error('❌ Network Error:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
};

// Test function that can be called from browser console
if (typeof window !== 'undefined') {
    (window as any).testNIALogin = testNIAAdminLogin;
}