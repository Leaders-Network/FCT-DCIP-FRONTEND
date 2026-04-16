// Test utility for NIA admin login
export const testNIAAdminLogin = async () => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
        const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';

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

        if (response.ok) {
            const data = await response.json();

            if (data.success) {
                return { success: true, data };
            } else {
                return { success: false, error: data.message };
            }
        } else {
            const errorText = await response.text();
            return { success: false, error: errorText, status: response.status };
        }
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
};

// Test function that can be called from browser console
if (typeof window !== 'undefined') {
    (window as unknown as Window & { testNIALogin: typeof testNIAAdminLogin }).testNIALogin = testNIAAdminLogin;
}