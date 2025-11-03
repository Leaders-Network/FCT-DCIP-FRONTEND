# API Services

This directory contains service classes for interacting with the backend APIs.

## Services

### `userConflictInquiries.ts`
Handles user conflict inquiry management for both AMMC and NIA admins:
- Fetch inquiries with filtering and pagination
- Assign inquiries to admins
- Respond to inquiries
- Add internal notes
- Close inquiries
- Get inquiry statistics

### `processingMonitor.ts`
Provides real-time monitoring of the automatic processing system:
- Processing overview and statistics
- Active processing jobs
- Performance metrics
- System health monitoring
- Recent activity feeds

## Usage

```typescript
import { userConflictInquiriesService } from '@/services/userConflictInquiries';
import { processingMonitorService } from '@/services/processingMonitor';

// Fetch inquiries for NIA organization
const response = await userConflictInquiriesService.getInquiries({
    organization: 'NIA',
    status: 'open',
    page: 1,
    limit: 20
});

// Get processing overview
const overview = await processingMonitorService.getOverview('AMMC', '24h');
```

## Configuration

The API base URL is configured in `src/utils/api.ts` and can be overridden with the `NEXT_PUBLIC_API_URL` environment variable.

## Authentication

All API calls automatically include authentication tokens from localStorage. The system supports multiple token keys for flexibility:
- `niaAdminToken`
- `adminToken` 
- `token`
- `authToken`

## Error Handling

All services return a consistent response format:
```typescript
{
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
}
```

Services handle errors gracefully and provide meaningful error messages to the UI components.