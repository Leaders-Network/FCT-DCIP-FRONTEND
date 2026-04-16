// Simple API test utility
export const testUserConflictInquiriesAPI = async () => {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
        const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';

        const response = await fetch(`${baseUrl}/user-conflict-inquiries/admin?status=all&urgency=all&conflictType=all&organization=AMMC&page=1&limit=10`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'apikey': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
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
    (window as unknown as Window & { testAPI: typeof testUserConflictInquiriesAPI }).testAPI = testUserConflictInquiriesAPI;
}