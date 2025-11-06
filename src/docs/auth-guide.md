# API Authentication Guide

## How the API Interceptor Works

The API interceptor automatically detects the appropriate token type based on the request URL:

### Token Type Detection

1. **NIA Admin** (`nia-admin` token):
   - `/nia-admin/*` endpoints
   - `/processing-monitor/*` endpoints

2. **Surveyor** (`surveyor` token):
   - `/surveyor/*` endpoints  
   - `/dual-assignment/*` endpoints

3. **AMMC Admin** (`admin` token):
   - `/admin/*` endpoints (excluding `/nia-admin`)

4. **Super Admin** (`super-admin` token):
   - `/super-admin/*` endpoints

5. **User** (`user` token):
   - `/user/*` endpoints
   - `/policy/*` endpoints
   - `/payment/*` endpoints
   - `/auth/login` and `/auth/register`

6. **Auto-detect**: If no specific pattern matches, uses token priority fallback

### Token Priority Fallback
1. `superAdminToken` (highest priority)
2. `niaAdminToken`
3. `adminToken` 
4. `surveyorToken`
5. `userToken`
6. `token` (legacy)
7. `authToken` (legacy)

### Usage
The interceptor automatically handles authentication - no manual token management needed in components.