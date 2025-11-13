# Broker Admin Management Component

A comprehensive management interface for creating, viewing, editing, and managing broker administrator accounts in the FCT-DCIP platform.

## Features

### 1. Dashboard Statistics
- Total broker admins count
- Active/Inactive/Suspended status breakdown
- Total broker firms count
- Real-time statistics updates

### 2. Broker Admin List
- Paginated table view of all broker admins
- Search functionality (by name, email, firm name)
- Status filtering (all, active, inactive, suspended)
- Sortable columns

### 3. Create Broker Admin
- Complete registration form with validation
- Personal information (name, email, phone)
- Broker firm details (firm name, license, license number)
- Position and department assignment
- Granular permission settings:
  - Can View Claims
  - Can Update Claim Status
  - Can View Reports
  - Can Access Analytics

### 4. Edit Broker Admin
- Update broker firm information
- Modify permissions
- Change position and department
- Update license details

### 5. View Details
- Comprehensive view of broker admin profile
- Personal information display
- Broker firm information
- Permission status overview
- Status badges

### 6. Deactivate Broker Admin
- Soft delete functionality
- Confirmation dialog
- Status change to inactive

## Usage

### Access the Page

Navigate to:
```
/admin/broker-admins
```

**Note:** This page requires Super Admin access.

### API Integration

The component uses the following API endpoints:

```typescript
// Get all broker admins
GET /api/v1/broker-admin/management
Query params: status, search, page, limit

// Get statistics
GET /api/v1/broker-admin/management/stats

// Get broker admin by ID
GET /api/v1/broker-admin/management/:id

// Create broker admin
POST /api/v1/broker-admin/management
Body: {
  firstname, lastname, email, phonenumber, password,
  brokerFirmName, brokerFirmLicense, licenseNumber,
  department, position, permissions
}

// Update broker admin
PATCH /api/v1/broker-admin/management/:id
Body: { brokerFirmName, permissions, profile, status, ... }

// Deactivate broker admin
DELETE /api/v1/broker-admin/management/:id
```

### Required Permissions

- **Super Admin** access is required to:
  - View the broker admin management page
  - Create new broker admins
  - Edit existing broker admins
  - Deactivate broker admins

## Component Props

```typescript
interface BrokerAdminManagementProps {
  onCreateBrokerAdmin?: (data: any) => Promise<void>;
  onUpdateBrokerAdmin?: (id: string, data: any) => Promise<void>;
  onDeleteBrokerAdmin?: (id: string) => Promise<void>;
}
```

All props are optional. If not provided, the component uses its internal API calls.

## Form Validation

### Required Fields (Create)
- First Name
- Last Name
- Email (must be valid email format)
- Phone Number
- Password
- Broker Firm Name
- Broker Firm License
- License Number

### Optional Fields
- Department (defaults to "Claims Management")
- Position (defaults to "Broker Administrator")
- Permissions (all have default values)

## Status Badges

- **Active** (Green): Broker admin is active and can log in
- **Inactive** (Gray): Broker admin is deactivated
- **Suspended** (Red): Broker admin is temporarily suspended

## Permissions Explained

1. **Can View Claims**: Allows viewing all claims in the system
2. **Can Update Claim Status**: Allows changing claim status (under_review, rejected, completed)
3. **Can View Reports**: Allows accessing claim reports
4. **Can Access Analytics**: Allows viewing analytics and statistics

## Integration with Existing System

The broker admin management integrates with:

1. **Employee Model**: Creates Employee records with organization='Broker'
2. **BrokerAdmin Model**: Creates broker-specific profile data
3. **Role System**: Uses 'Broker-Admin' role
4. **Status System**: Uses 'Active'/'Inactive' status
5. **Authentication**: Broker admins can log in at `/broker-admin/login`

## Styling

The component uses:
- Tailwind CSS for styling
- Lucide React for icons
- Responsive design (mobile-friendly)
- Modal dialogs for create/edit/view operations

## Error Handling

- API errors are caught and displayed via alerts
- Form validation prevents invalid submissions
- Confirmation dialogs for destructive actions
- Loading states during API calls

## Future Enhancements

Potential improvements:
- Bulk operations (activate/deactivate multiple admins)
- Export broker admin list to CSV
- Advanced filtering (by firm, date range)
- Activity logs per broker admin
- Email notifications on account creation
- Password reset functionality
