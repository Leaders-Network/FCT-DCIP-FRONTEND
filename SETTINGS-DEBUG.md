# Settings Page Debugging Guide

## Changes Applied ✅

Added comprehensive console logging to track the password change flow:

1. **Button Click** - Logs when button is clicked
2. **Form Submit** - Logs when form submission starts
3. **Validation** - Logs validation failures
4. **API Call** - Logs when API request is made
5. **Response** - Logs API response
6. **Errors** - Logs any errors with full details

## Testing Steps

### 1. Open Browser Console
1. Go to `http://localhost:3000/dashboard/settings`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Clear console (Ctrl+L or Cmd+K)

### 2. Try Changing Password
Fill in the password form and click "Change Password"

### 3. Check Console Logs
You should see these logs in order:

```
🖱️ Change Password button clicked
🔐 Password change initiated
📡 Making API call to /settings/change-password
✅ API response: { success: true, message: "..." }
```

### 4. Troubleshooting

#### If you see NO logs at all:
- **Problem**: JavaScript not loading or page error
- **Solution**: 
  - Check browser console for errors
  - Refresh the page (Ctrl+R)
  - Clear browser cache

#### If you see "🖱️ Change Password button clicked" but nothing else:
- **Problem**: Form submission is being prevented
- **Solution**: 
  - Check if there are any JavaScript errors
  - Make sure all password fields are filled
  - Check if button is disabled

#### If you see "❌ Passwords do not match":
- **Problem**: New password and confirm password don't match
- **Solution**: Make sure both new password fields have the same value

#### If you see "❌ Password too short":
- **Problem**: Password is less than 6 characters
- **Solution**: Use a password with at least 6 characters

#### If you see "📡 Making API call..." but then an error:
- **Problem**: Backend issue or network error
- **Solution**:
  - Check if backend is running on http://localhost:5000
  - Check Network tab in DevTools for the actual error
  - Look at backend console for error logs
  - Verify you're logged in (check localStorage.token exists)

#### If you see "❌ Password change error":
- **Problem**: API returned an error
- **Solution**:
  - Check the error message in console
  - Common errors:
    - "Current password is incorrect" - Wrong current password
    - "Authentication invalid" - Token expired, login again
    - "Failed to change password" - Backend error, check backend logs

### 5. Network Tab Check
1. Open DevTools Network tab
2. Try changing password
3. Look for request to `/api/v1/settings/change-password`
4. Click on it to see:
   - Request Headers (should have Authorization and apikey)
   - Request Payload (should have currentPassword, newPassword, confirmPassword)
   - Response (should show success or error message)

### 6. Backend Logs
Check your backend console for:
```
🔐 Verifying token...
✅ Token verified. Payload: { userId, model, role }
Password change request: { userId, model }
Password changed successfully for user: [userId]
```

## Common Issues & Solutions

### Issue: Button doesn't respond
**Check:**
- Is the button disabled? (should not be grayed out)
- Are all three password fields filled?
- Any console errors?

### Issue: "Failed to change password"
**Check:**
- Backend server is running
- Current password is correct
- Token is valid (try logging in again)

### Issue: No API call in Network tab
**Check:**
- Form validation might be failing
- Check console for validation error messages
- Make sure passwords match and are at least 6 characters

## Quick Test Script

Run this in browser console to test the API directly:

```javascript
// Test if API is accessible
fetch('http://localhost:5000/api/v1/settings/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'apikey': '4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c',
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => {
  console.log('Profile API works:', data);
})
.catch(err => {
  console.error('Profile API failed:', err);
});
```

## Files Modified
- `FCT-DCIP-FRONTEND/src/app/dashboard/settings/page.tsx` - Added debugging logs
- `FCT-DCIP-BACKEND/controllers/settings.js` - Fixed authentication and added logs

## Next Steps
1. Open browser console
2. Try changing password
3. Share the console logs if it still doesn't work
4. Check Network tab for API calls
5. Check backend console for logs
