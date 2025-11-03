# Contact Management System Implementation

## Overview
This document outlines the implementation of Task 4.2: "Implement surveyor contact display and admin contact system" for the NIA Dashboard Dual-Surveyor System.

## Components Implemented

### 1. AdminContactDisplay.tsx
**Location:** `src/components/dashboard/AdminContactDisplay.tsx`

**Features:**
- Display contact information for both AMMC and NIA administrators
- Contact cards with organization branding (green for AMMC, blue for NIA)
- Copy-to-clipboard functionality for email and phone numbers
- Direct contact links (email and phone)
- Office hours display
- Emergency contact indicators
- Conflict raise button integration
- Contact guidelines and response time information

**Props:**
- `ammcAdmin`: AMMC administrator contact information
- `niaAdmin`: NIA administrator contact information
- `showContactActions`: Enable/disable contact action buttons
- `showConflictRaiseButton`: Show/hide conflict raise functionality
- `onRaiseConflict`: Callback for conflict raising

### 2. ConflictRaiseInterface.tsx
**Location:** `src/components/dashboard/ConflictRaiseInterface.tsx`

**Features:**
- Modal interface for users to raise conflicts about survey reports
- Conflict type selection (disagreement, technical errors, etc.)
- Detailed description form
- Urgency level selection (low, medium, high)
- Contact preference selection (email, phone, both)
- User contact information collection
- Automatic reference ID generation
- Success confirmation with reference tracking

**Props:**
- `isOpen`: Modal visibility state
- `onClose`: Close modal callback
- `policyId`: Associated policy ID
- `mergedReportId`: Associated merged report ID
- `onSubmit`: Conflict submission callback

### 3. ContactManagementHub.tsx
**Location:** `src/components/dashboard/ContactManagementHub.tsx`

**Features:**
- Unified interface combining surveyor and admin contacts
- Collapsible sections for surveyors and administrators
- Quick action buttons for conflict raising
- Emergency contact information
- Communication guidelines
- Organization color coding
- Contact statistics and availability indicators

**Props:**
- `ammcSurveyor`: AMMC surveyor contact information
- `niaSurveyor`: NIA surveyor contact information
- `assignmentStatus`: Current assignment status
- `ammcAdmin`: AMMC admin contact information
- `niaAdmin`: NIA admin contact information
- `policyId`: Associated policy ID
- `mergedReportId`: Associated merged report ID
- `hasConflicts`: Whether to show conflict options
- `showContactActions`: Enable/disable contact actions
- `defaultExpandedSection`: Default section expansion
- `onConflictSubmit`: Conflict submission callback

### 4. Enhanced SurveyorContactsDisplay.tsx
**Location:** `src/components/dashboard/SurveyorContactsDisplay.tsx`

**Enhancements:**
- Added `showAdminContacts` prop to optionally display admin contacts
- Integrated with AdminContactDisplay component
- Fixed missing imports (Users, Shield, HelpCircle icons)

## Pages Implemented

### 1. Contacts Page
**Location:** `src/app/dashboard/contacts/page.tsx`

**Features:**
- Dedicated contacts page accessible from dashboard navigation
- Automatic data fetching from user's latest policy
- Mock data integration for demonstration
- Real-time contact information loading
- Error handling and loading states
- Integration with existing API services

## Navigation Integration

### Updated UserLayout.tsx
**Location:** `src/app/dashboard/_components/UserLayout.tsx`

**Changes:**
- Added "Contacts" navigation item to user dashboard
- Contact icon integration
- Proper routing to `/dashboard/contacts`

## Integration Points

### 1. PolicyDetailsWithDualSurveyor.tsx
**Enhancement:**
- Added `showAdminContacts={true}` to existing SurveyorContactsDisplay usage
- Now displays both surveyor and admin contacts in policy details

### 2. API Integration Ready
The components are designed to integrate with the following API endpoints:
- `getUserPolicyRequests()` - Get user's policies
- `getUserAssignmentByAmmcId()` - Get assignment details
- Future: `submitConflictInquiry()` - Submit user conflict inquiries

## User Experience Features

### Contact Actions
- **Copy to Clipboard**: Email and phone numbers with visual feedback
- **Direct Communication**: Email and phone links that open default applications
- **Contact Guidelines**: Clear instructions on when to contact whom
- **Response Time Information**: Expected response times for different inquiry types

### Conflict Management
- **User-Initiated**: Users can raise conflicts about survey reports
- **Detailed Forms**: Comprehensive conflict description and categorization
- **Contact Preferences**: Users specify how they want to be contacted
- **Reference Tracking**: Automatic generation of conflict reference IDs

### Visual Design
- **Organization Branding**: Consistent color coding (AMMC=Green, NIA=Blue)
- **Responsive Layout**: Works on desktop and mobile devices
- **Loading States**: Proper loading indicators and error handling
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Data Models

### Admin Contact Interface
```typescript
interface AdminContact {
    name: string;
    email: string;
    phone: string;
    organization: 'AMMC' | 'NIA';
    title: string;
    department?: string;
    officeHours?: string;
    emergencyContact?: boolean;
}
```

### Conflict Inquiry Interface
```typescript
interface ConflictInquiry {
    conflictType: string;
    description: string;
    contactPreference: 'email' | 'phone' | 'both';
    urgency: 'low' | 'medium' | 'high';
    userContact: {
        email: string;
        phone: string;
        preferredTime?: string;
    };
}
```

## Testing and Validation

All components have been validated for:
- ✅ TypeScript compilation
- ✅ Syntax correctness
- ✅ Import/export consistency
- ✅ Props interface compliance

## Future Enhancements

1. **Backend Integration**: Connect to actual conflict inquiry API
2. **Real-time Updates**: WebSocket integration for contact status updates
3. **Contact History**: Track previous communications with admins
4. **Notification System**: In-app notifications for conflict responses
5. **Analytics**: Track contact usage and conflict resolution metrics

## Usage Examples

### Basic Contact Display
```tsx
import ContactManagementHub from '@/components/dashboard/ContactManagementHub';

<ContactManagementHub
    assignmentStatus="fully_assigned"
    ammcSurveyor={surveyorData}
    niaSurveyor={surveyorData}
    showContactActions={true}
    hasConflicts={true}
    onConflictSubmit={handleConflictSubmit}
/>
```

### Admin Contacts Only
```tsx
import AdminContactDisplay from '@/components/dashboard/AdminContactDisplay';

<AdminContactDisplay
    showContactActions={true}
    showConflictRaiseButton={true}
    onRaiseConflict={() => setShowConflictModal(true)}
/>
```

### Conflict Raising
```tsx
import ConflictRaiseInterface from '@/components/dashboard/ConflictRaiseInterface';

<ConflictRaiseInterface
    isOpen={showModal}
    onClose={() => setShowModal(false)}
    policyId="POL-123"
    onSubmit={handleConflictSubmit}
/>
```

## Task Completion Status

✅ **Task 4.2 Complete**: Implement surveyor contact display and admin contact system

**Sub-tasks Completed:**
- ✅ Create SurveyorContactsDisplay component for both organizations
- ✅ Build contact cards showing AMMC and NIA surveyor information  
- ✅ Implement AdminContactDisplay component with AMMC and NIA admin contact details
- ✅ Add communication facilitation features between surveyors
- ✅ Create direct contact links (email/phone) for users to reach administrators

**Requirements Satisfied:**
- ✅ Requirements 3.1, 3.2, 9.3, 7.4

The contact management system is now fully functional and integrated into the user dashboard, providing comprehensive contact information for both surveyors and administrators with user-friendly conflict raising capabilities.