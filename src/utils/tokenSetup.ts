/**
 * Token setup utility for testing and development
 */

export const setupTestTokens = () => {
    if (typeof window === 'undefined') return;
    
    // Set up test tokens for both admin types
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGZmMzlhOTE3YTBjYzU1ZDc1OGYwMGUiLCJmdWxsbmFtZSI6IlN1cGVyIEFkbWluIiwic3RhdHVzIjoiQWN0aXZlIiwicm9sZSI6IlN1cGVyLWFkbWluIiwibW9kZWwiOiJFbXBsb3llZSIsImlhdCI6MTc2MTk0MjgzMywiZXhwIjoxNzY0NTM0ODMzfQ.bUH4soIgSV_NMjimtaY2htAtsbF-1kUBMkknpRD2co4';
    
    // Set tokens for different admin types
    localStorage.setItem('adminToken', testToken);
    localStorage.setItem('niaAdminToken', testToken);
    localStorage.setItem('token', testToken);
    
    // Set admin info
    localStorage.setItem('niaAdminInfo', JSON.stringify({
        name: 'NIA Test Admin',
        email: 'admin@nia.org.ng',
        role: 'nia-admin'
    }));
    
    localStorage.setItem('adminInfo', JSON.stringify({
        name: 'AMMC Test Admin', 
        email: 'admin@ammc.gov.ng',
        role: 'admin'
    }));
    
    console.log('Test tokens set up successfully');
};

export const clearAllTokens = () => {
    if (typeof window === 'undefined') return;
    
    const tokenKeys = [
        'adminToken',
        'niaAdminToken', 
        'token',
        'authToken',
        'adminInfo',
        'niaAdminInfo'
    ];
    
    tokenKeys.forEach(key => {
        localStorage.removeItem(key);
    });
    
    console.log('All tokens cleared');
};

export const debugTokens = () => {
    if (typeof window === 'undefined') return;
    
    console.log('=== TOKEN DEBUG INFO ===');
    console.log('adminToken:', localStorage.getItem('adminToken') ? 'Present' : 'Missing');
    console.log('niaAdminToken:', localStorage.getItem('niaAdminToken') ? 'Present' : 'Missing');
    console.log('token:', localStorage.getItem('token') ? 'Present' : 'Missing');
    console.log('authToken:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
    console.log('adminInfo:', localStorage.getItem('adminInfo') ? 'Present' : 'Missing');
    console.log('niaAdminInfo:', localStorage.getItem('niaAdminInfo') ? 'Present' : 'Missing');
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('========================');
};

// Auto-setup tokens in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Check if tokens are missing and set them up
    const hasTokens = localStorage.getItem('adminToken') || 
                     localStorage.getItem('niaAdminToken') || 
                     localStorage.getItem('token');
    
    if (!hasTokens) {
        console.log('No tokens found, setting up test tokens...');
        setupTestTokens();
    } else {
        console.log('Tokens already present, debugging current state...');
        debugTokens();
    }
}