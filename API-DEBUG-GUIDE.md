# API Connection Debug Guide

## Issues Fixed

### 1. API Key Header Case Sensitivity
- **Problem**: Backend expects `apikey` (lowercase) but frontend was sending mixed case
- **Fix**: Updated API client to use lowercase `apikey` header consistently

### 2. API Base URL Configuration
- **Problem**: Frontend was trying to connect to `localhost:5000` which may not be running
- **Fix**: Updated to use production API URL by default: `https://fct-dcip-backend.vercel.app/api/v1`

### 3. Enhanced Error Logging
- **Added**: Comprehensive request/response interceptors for better debugging
- **Added**: API connection test utility (`src/utils/apiTest.ts`)

## Testing the Connection

### Automatic Tests
When you load the NIA admin pages in development mode, the following will run automatically:
1. Token setup (if no tokens exist)
2. API connection test
3. Debug information in browser console

### Manual Testing
Open browser console and run:
```javascript
// Test basic API connection
testApiConnection()

// Test login with credentials
testLogin('your-email@example.com', 'your-password')
```

## Debug Information

### Check Browser Console
Look for these log messages:
- `✅ API Connection successful` - API is reachable
- `❌ API Connection failed` - Check network/API key
- `Token setup` - Authentication tokens status
- `Request Headers` - Verify API key and auth headers

### Common Issues & Solutions

#### 401 Unauthorized
- **Cause**: Invalid API key or missing authentication
- **Check**: API key matches between frontend and backend
- **Fix**: Verify `apikey` header is lowercase

#### Network Error / Connection Refused
- **Cause**: Backend not running or wrong URL
- **Check**: Backend is running on correct port
- **Fix**: Update `NEXT_PUBLIC_API_BASE_URL` in `.env`

#### CORS Issues
- **Cause**: Frontend domain not allowed by backend
- **Check**: Backend CORS configuration includes frontend URL
- **Fix**: Add frontend URL to backend CORS whitelist

## Environment Configuration

### Frontend (.env)
```
NEXT_PUBLIC_API_BASE_URL=https://fct-dcip-backend.vercel.app/api/v1
NEXT_PUBLIC_API_KEY=4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c
```

### Backend (.env)
```
API_KEY=4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c
PORT=5000
```

## Next Steps

1. **Start the application** and check browser console for debug messages
2. **Test login** with valid credentials
3. **Check network tab** in browser dev tools for request details
4. **Verify backend is running** if using localhost
5. **Check API key match** between frontend and backend

## Production Deployment

For production, ensure:
- API keys match between frontend and backend
- CORS is properly configured
- HTTPS is used for API endpoints
- Environment variables are set correctly