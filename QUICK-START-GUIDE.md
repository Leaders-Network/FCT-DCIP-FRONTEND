# Quick Start Guide - Fixed URL Duplication Issue

## ✅ **Issue Fixed!**

The URL duplication problem (`http://localhost:5000/api/v1/api/v1`) has been resolved by:
- Removing `/api/v1` from service baseUrl paths
- Services now use relative paths that work with the axios base URL

## 🚀 **To Test the Application:**

### Option 1: Use Local Backend (Recommended)

1. **Start the Backend:**
   ```bash
   cd FCT-DCIP-BACKEND
   npm run dev
   ```
   
2. **Verify Backend is Running:**
   - You should see: "Server is listening on port 5000..."
   - The backend will be available at `http://localhost:5000`

3. **Start the Frontend:**
   ```bash
   cd FCT-DCIP-FRONTEND
   npm run dev
   ```

4. **Test the Admin Dashboards:**
   - NIA Admin: `http://localhost:3000/nia-admin/user-inquiries`
   - AMMC Admin: `http://localhost:3000/admin/dashboard/user-inquiries`

### Option 2: Use Production Backend

1. **Update Environment:**
   ```bash
   # In FCT-DCIP-FRONTEND/.env
   NEXT_PUBLIC_API_BASE_URL=https://fct-dcip-backend.vercel.app/api/v1
   ```

2. **Get Correct API Key:**
   - Check Vercel dashboard for backend project
   - Update `NEXT_PUBLIC_API_KEY` with production key

## 🔧 **What Was Fixed:**

### Before (Broken):
```
Service baseUrl: '/api/v1/user-conflict-inquiries'
Axios baseURL: 'http://localhost:5000/api/v1'
Result: http://localhost:5000/api/v1/api/v1/user-conflict-inquiries ❌
```

### After (Fixed):
```
Service baseUrl: '/user-conflict-inquiries'
Axios baseURL: 'http://localhost:5000/api/v1'
Result: http://localhost:5000/api/v1/user-conflict-inquiries ✅
```

## 📋 **Expected Behavior:**

With local backend running, you should see:
- ✅ No more 404 errors
- ✅ Admin dashboards loading data
- ✅ User inquiries and processing monitor working
- ✅ Authentication working properly

## 🐛 **If Still Having Issues:**

1. **Check Backend is Running:**
   ```bash
   curl http://localhost:5000/api/v1/auth/available-categories
   ```

2. **Check Frontend Environment:**
   - Restart frontend after environment changes
   - Clear browser cache/localStorage

3. **Check Console Logs:**
   - Look for successful API requests
   - Verify URLs are correct (no duplication)

The URL duplication issue is now fixed! 🎉