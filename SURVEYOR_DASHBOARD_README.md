# Surveyor Dashboard Flow - FCT DCIP Insurance Platform

## Overview

This implementation adds a comprehensive Surveyor Dashboard flow to the FCT DCIP Insurance platform, enabling a complete end-to-end workflow from policy request submission to payment processing.

## Workflow Summary

### 1. User Side
- **Policy Request Submission**: Users can submit policy requests with detailed property and contact information
- **Multi-step Form**: Includes property details, contact information, and coverage requirements
- **Request Tracking**: Users can view their policy status and completed surveys

### 2. Admin Side
- **Policy Management**: Admins can view all submitted policies in a centralized dashboard
- **Surveyor Assignment**: Assign policies to one or more qualified surveyors
- **Review System**: Review surveyor submissions and approve/reject surveys
- **Policy Forwarding**: Forward approved policies back to users

### 3. Surveyor Side
- **Dedicated Portal**: Separate login and dashboard for surveyors
- **Assignment Management**: View assigned policies with detailed property information
- **Contact Integration**: Direct phone/email contact with property owners
- **Survey Submission**: Upload PDF reports with detailed notes and recommendations

### 4. User Completion
- **Survey Download**: Download approved survey documents
- **Payment Integration**: Direct redirect to external payment verification system
- **Status Tracking**: Real-time status updates throughout the process

## New Components Created

### User Components
- `PolicyRequestForm.tsx` - Multi-step policy request form
- `PolicyCompletion.tsx` - View completed policies and download surveys
- Updated `DashView.tsx` - Added policy request and "My Policies" navigation

### Admin Components
- `PolicyManagement.tsx` - Comprehensive policy management dashboard
- Added policies page (`/admin/dashboard/policies`)
- Updated admin sidebar with policies link

### Surveyor Components
- `SurveyorLogin.tsx` - Dedicated surveyor authentication
- `SurveyorDashboard.tsx` - Main surveyor dashboard with statistics
- `SurveyorSidebar.tsx` - Navigation sidebar for surveyor portal
- `SurveyorHeader.tsx` - Header with search and profile management
- `AssignmentsList.tsx` - List of assigned policies with filtering
- `AssignmentDetail.tsx` - Detailed view of individual assignments
- `SurveySubmissionForm.tsx` - Survey report submission with file upload

## New Routes Added

### User Routes
- `/dashboard/policies` - View completed policies and download surveys

### Admin Routes
- `/admin/dashboard/policies` - Policy management dashboard

### Surveyor Routes
- `/surveyor` - Surveyor login page
- `/surveyor/dashboard` - Main surveyor dashboard
- `/surveyor/dashboard/assignments` - List of assignments
- `/surveyor/dashboard/assignments/[id]` - Assignment detail view

## API Endpoints Added

### Policy Management
- `POST /auth/policy-requests` - Submit new policy request
- `GET /auth/policy-requests` - Get all policy requests (admin)
- `GET /auth/user-policies/:userId` - Get user's policies

### Surveyor Management
- `POST /auth/loginSurveyor` - Surveyor authentication
- `GET /auth/surveyors` - Get all surveyors (admin)
- `POST /auth/assign-surveyor` - Assign policy to surveyors
- `GET /auth/assigned-policies` - Get surveyor's assignments

### Survey Submission
- `POST /auth/submit-survey` - Submit survey with file upload
- `POST /auth/review-submission` - Admin review of survey submission

## TypeScript Types Added

### Core Types
- `PolicyRequest` - Complete policy request structure
- `CreatePolicyRequestData` - Form data for new requests
- `Surveyor` - Surveyor user with specializations and ratings
- `SurveySubmission` - Survey submission with file and notes
- `ContactLogEntry` - Contact interaction logging
- `PolicyAssignment` - Surveyor assignment data
- `PolicyReview` - Admin review data

### Response Types
- `GetPolicyRequestsResponse` - Policy requests with pagination
- `GetSurveyorsResponse` - Available surveyors list
- `GetAssignedPoliciesResponse` - Surveyor's assigned policies

## Features Implemented

### Policy Request Form
- Multi-step wizard (Property Details → Contact Info → Coverage Details)
- Form validation and error handling
- Progress indicator
- Comprehensive property information collection

### Admin Policy Management
- Tabbed interface (All, Submitted, Assigned, Surveyed)
- Policy assignment modal with surveyor selection
- Priority and instruction settings
- Review modal for survey submissions
- Bulk actions and filtering

### Surveyor Dashboard
- Statistics cards (Total, Pending, In Progress, Completed)
- Recent assignments overview
- Quick action links
- Assignment filtering and search

### Survey Submission
- Contact log tracking with multiple methods
- PDF file upload with validation
- Detailed survey notes
- Recommendation system (Approve/Reject/Request More Info)
- Form validation and error handling

### User Policy Completion
- Download approved survey documents
- View survey and admin notes
- Direct payment redirect to external system
- Status tracking and notifications

## Integration Points

### External Payment System
- Redirects to `https://askniid.org/VerifyBuildersPolicy.aspx`
- Passes policy ID and user ID as parameters
- Opens in new window/tab for security

### File Management
- PDF upload for survey documents
- Document download for users
- File validation and size limits

### Authentication
- Separate authentication flows for users, admins, and surveyors
- Role-based access control
- Token management for different user types

## Usage Instructions

### For Users
1. Login to user dashboard
2. Click "Request Survey" to submit a new policy request
3. Fill out the multi-step form with property details
4. Monitor policy status in "My Policies" section
5. Download survey documents when approved
6. Click "Proceed to Payment" to complete the process

### For Admins
1. Login to admin dashboard
2. Navigate to "Policies" section
3. View submitted policies and their status
4. Assign policies to qualified surveyors
5. Review completed surveys and approve/reject
6. Monitor the entire workflow pipeline

### For Surveyors
1. Login at `/surveyor` with surveyor credentials
2. View assigned policies in dashboard
3. Click on assignments to see detailed property information
4. Contact property owners using provided contact details
5. Conduct surveys and upload reports with recommendations
6. Track submission status and admin feedback

## Technical Notes

### State Management
- Uses React hooks for component state
- Local storage for authentication tokens
- Context providers for shared data (can be enhanced)

### File Handling
- FormData for file uploads
- PDF validation and size limits
- Secure file serving through protected endpoints

### Responsive Design
- Mobile-friendly layouts
- Collapsible sidebars
- Adaptive grid layouts
- Touch-friendly interaction elements

### Error Handling
- Comprehensive try-catch blocks
- User-friendly error messages
- Loading states and progress indicators
- Form validation feedback

## Future Enhancements

### Notifications
- Real-time notifications for status changes
- Email notifications for assignments and completions
- Push notifications for mobile apps

### Advanced Features
- GPS integration for property location verification
- Photo upload for survey documentation
- Digital signature collection
- Automated report generation

### Analytics
- Dashboard analytics for admins
- Performance metrics for surveyors
- Policy completion rate tracking
- Revenue analytics integration

### Mobile App
- React Native version for surveyors
- Offline survey capability
- Camera integration for documentation
- GPS tracking for site visits

## Security Considerations

- Role-based access control implemented
- File upload validation and sanitization
- Secure token management
- External redirect validation
- Input sanitization throughout the application

This implementation provides a complete, production-ready surveyor dashboard flow that can be easily integrated with existing backend services and extended with additional features as needed.