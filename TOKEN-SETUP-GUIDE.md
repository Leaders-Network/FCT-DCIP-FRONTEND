# Token Setup Guide for Admin Dashboards

## Issue
The new admin dashboard pages (User Inquiries and Processing Monitor) require authentication tokens to function properly. If you see "No authentication token found" errors, follow this guide.

## Quick Fix - Browser Console

Open your browser's Developer Tools (F12) and run this command in the Console:

```javascript
// Set up test tokens for development
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGZmMzlhOTE3YTBjYzU1ZDc1OGYwMGUiLCJmdWxsbmFtZSI6IlN1cGVyIEFkbWluIiwic3RhdHVzIjoiQWN0aXZlIiwicm9sZSI6IlN1cGVyLWFkbWluIiwibW9kZWwiOiJFbXBsb3llZSIsImlhdCI6MTc2MTk0MjgzMywiZXhwIjoxNzY0NTM0ODMzfQ.bUH4soIgSV_NMjimtaY2htAtsbF-1kUBMkknpRD2co4';

// Set tokens for both admin types
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

console.log('✅ Test tokens set up successfully! Refresh the page.');
```

## Automatic Setup

The pages now include automatic token setup for development. If no tokens are found, they will be set up automatically.

## Debug Tokens

To see what tokens are currently available, run this in the console:

```javascript
console.log('=== TOKEN DEBUG INFO ===');
console.log('adminToken:', localStorage.getItem('adminToken') ? 'Present' : 'Missing');
console.log('niaAdminToken:', localStorage.getItem('niaAdminToken') ? 'Present' : 'Missing');
console.log('token:', localStorage.getItem('token') ? 'Present' : 'Missing');
console.log('All localStorage keys:', Object.keys(localStorage));
```

## Clear Tokens

To clear all tokens and start fresh:

```javascript
['adminToken', 'niaAdminToken', 'token', 'authToken', 'adminInfo', 'niaAdminInfo'].forEach(key => {
    localStorage.removeItem(key);
});
console.log('🗑️ All tokens cleared');
```

## Token Priority

The pages will look for tokens in this order:
1. `niaAdminToken` (for NIA admin pages)
2. `adminToken` (for AMMC admin pages)  
3. `token` (general token)
4. `authToken` (fallback token)

## Pages That Need Tokens

- `/nia-admin/user-inquiries` - NIA User Conflict Inquiries
- `/nia-admin/processing-monitor` - Automatic Processing Monitor
- `/admin/dashboard/user-inquiries` - AMMC User Conflict Inquiries
- `/admin/dashboard/processing-monitor` - AMMC Processing Monitor

## Mock Data Fallback

If no tokens are found, the pages will use mock data for demonstration purposes. This allows you to see the interface and functionality even without proper authentication.

## Production Notes

In production, these tokens would be set automatically upon login. The token setup utilities are only for development and testing purposes.