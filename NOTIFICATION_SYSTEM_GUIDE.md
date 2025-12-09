# Notification System Implementation Guide

## Overview
Complete notification system for the FCT-DCIP platform with real-time updates, email notifications, and in-app notifications.

## Architecture

### Backend Components
1. **Notification Model** (`FCT-DCIP-BACKEND/models/Notification.js`)
   - MongoDB schema for storing notifications
   - Automatic expiration support
   - Read/unread tracking
   - Priority levels

2. **Enhanced Notification Service** (`FCT-DCIP-BACKEND/services/EnhancedNotificationService.js`)
   - Create notifications
   - Send email notifications
   - Bulk notification creation
   - Pre-built notification types

3. **API Routes** (`FCT-DCIP-BACKEND/routes/notifications.js`)
   - GET `/notifications` - Get user notifications
   - GET `/notifications/unread-count` - Get unread count
   - PATCH `/notifications/:id/read` - Mark as read
   - PATCH `/notifications/mark-all-read` - Mark all as read
   - DELETE `/notifications/:id` - Delete notification

### Frontend Components
1. **Notification Context** (`src/context/NotificationContext.tsx`)
   - Global state management
   - Auto-refresh every 30 seconds
   - CRUD operations

2. **Notification Bell** (`src/components/shared/NotificationBell.tsx`)
   - Dropdown notification center
   - Unread count badge
   - Quick actions

3. **Notifications Page** (`src/components/shared/NotificationsPage.tsx`)
   - Full notification list
   - Filtering and sorting
   - Bulk actions

## Integration Steps

### Step 1: Backend Setup

#### 1.1 Add notification routes to main app
```javascript
// In FCT-DCIP-BACKEND/app.js or server.js
const notificationRoutes = require('./routes/notifications');
app.use('/api/v1/notifications', notificationRoutes);
```

#### 1.2 Use notification service in your code
```javascript
const EnhancedNotificationService = require('./services/EnhancedNotificationService');

// Example: When a policy is created
await EnhancedNotificationService.notifyPolicyCreated(
  policyId,
  userId,
  userEmail
);

// Example: When survey is assigned
await EnhancedNotificationService.notifyPolicyAssigned(
  policyId,
  surveyorId,
  surveyorEmail,
  assignmentId
);
```

### Step 2: Frontend Setup

#### 2.1 Wrap your app with NotificationProvider
```tsx
// In your root layout or _app.tsx
import { NotificationProvider } from '@/context/NotificationContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
```

#### 2.2 Add NotificationBell to your header/navbar
```tsx
import NotificationBell from '@/components/shared/NotificationBell';

function Header() {
  return (
    <header>
      {/* Other header content */}
      <NotificationBell />
    </header>
  );
}
```

#### 2.3 Use notifications in your components
```tsx
import { useNotifications } from '@/context/NotificationContext';

function MyComponent() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  
  return (
    <div>
      <p>You have {unreadCount} unread notifications</p>
    </div>
  );
}
```

## Notification Types

### Available Notification Types
- `policy_created` - Policy request submitted
- `policy_assigned` - Policy assigned to surveyor
- `policy_surveyed` - Survey completed
- `policy_approved` - Policy approved
- `policy_rejected` - Policy rejected
- `policy_requires_revision` - Revision required
- `assignment_created` - New assignment
- `assignment_reassigned` - Assignment reassigned
- `assignment_deadline_approaching` - Deadline warning
- `assignment_overdue` - Assignment overdue
- `survey_submitted` - Survey submitted for review
- `survey_reviewed` - Survey reviewed
- `report_ready` - Report ready for download
- `report_released` - Report released
- `payment_required` - Payment needed
- `payment_received` - Payment confirmed
- `conflict_detected` - Conflict in reports
- `system_alert` - System notification
- `message_received` - New message

## Creating Custom Notifications

### Backend
```javascript
await EnhancedNotificationService.create({
  recipientId: userId,
  recipientType: 'user',
  type: 'custom_type',
  title: 'Custom Notification',
  message: 'This is a custom notification message',
  priority: 'high',
  actionUrl: '/dashboard/custom',
  actionLabel: 'View Details',
  metadata: {
    customField: 'value',
    icon: 'Bell',
    color: 'blue'
  },
  sendEmail: true,
  recipientEmail: 'user@example.com'
});
```

## Styling & Customization

### Priority Colors
- `low` - Gray
- `medium` - Blue
- `high` - Orange
- `urgent` - Red

### Icons
Notifications use emoji icons by default. Customize in `getNotificationIcon()` function.

## Best Practices

1. **Always include actionUrl** - Makes notifications actionable
2. **Set appropriate priority** - Helps users prioritize
3. **Keep messages concise** - 1-2 sentences max
4. **Use metadata** - Store additional context
5. **Set expiration** - For time-sensitive notifications
6. **Send email for critical** - Important notifications should email

## Testing

### Test Notification Creation
```bash
# Using curl or Postman
POST /api/v1/notifications/test
{
  "recipientId": "user123",
  "type": "system_alert",
  "title": "Test Notification",
  "message": "This is a test"
}
```

### Check Unread Count
```bash
GET /api/v1/notifications/unread-count
Authorization: Bearer <token>
```

## Maintenance

### Clean Old Notifications
```javascript
// Run periodically (e.g., daily cron job)
const Notification = require('./models/Notification');
await Notification.deleteOldNotifications(30); // Delete read notifications older than 30 days
```

## Troubleshooting

### Notifications not appearing
1. Check if NotificationProvider is wrapping your app
2. Verify API routes are registered
3. Check browser console for errors
4. Verify authentication token is valid

### Unread count not updating
1. Check polling interval (default 30s)
2. Manually call `refreshUnreadCount()`
3. Check network tab for API calls

### Email notifications not sending
1. Verify email service configuration
2. Check SMTP settings
3. Review email service logs

## Future Enhancements

- [ ] Push notifications (Web Push API)
- [ ] SMS notifications
- [ ] Notification preferences/settings
- [ ] Notification grouping
- [ ] Real-time updates (WebSocket/SSE)
- [ ] Notification templates
- [ ] Multi-language support
- [ ] Notification analytics
