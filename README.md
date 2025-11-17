# FCT-DCIP Frontend

## 📋 Overview

The FCT-DCIP (Federal Capital Territory - Distress and Compulsory Insurance Policy) Frontend is a modern Next.js application that provides a comprehensive interface for managing insurance policy requests, dual surveyor assignments, and administrative operations for AMMC and NIA organizations.

## 🏗️ Architecture

### Tech Stack
- **Framework:** Next.js 14.2.13 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with Lucide icons
- **State Management:** React Hooks (useState, useEffect, useContext)
- **HTTP Client:** Fetch API
- **Authentication:** JWT with localStorage

### Key Features
- ✅ Multi-role dashboards (User, Admin, NIA Admin, Surveyor, Super Admin)
- ✅ Real-time assignment tracking
- ✅ Dual surveyor coordination interface
- ✅ Document upload and management
- ✅ Report viewing and downloading
- ✅ Responsive design for all devices
- ✅ Comprehensive filtering and search
- ✅ Interactive data visualizations

## 📁 Project Structure

```
FCT-DCIP-FRONTEND/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/         # User dashboard
│   │   ├── admin/             # AMMC admin pages
│   │   ├── nia-admin/         # NIA admin pages
│   │   ├── surveyor/          # Surveyor pages
│   │   └── ...
│   ├── components/            # React components
│   │   ├── admin/            # Admin components
│   │   ├── nia-admin/        # NIA admin components
│   │   ├── surveyor/         # Surveyor components
│   │   ├── user/             # User components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── ui/               # Reusable UI components
│   │   └── FileUpload/       # File upload components
│   ├── context/              # React Context providers
│   │   ├── AuthProvider.tsx  # Authentication context
│   │   └── useAuth.ts        # Auth hook
│   ├── services/             # API services
│   │   └── api.ts            # API client
│   ├── types/                # TypeScript types
│   │   └── api.types.ts      # API type definitions
│   ├── utils/                # Utility functions
│   │   ├── auth.ts           # Auth utilities
│   │   └── tokenSetup.ts     # Token management
│   ├── constants/            # Application constants
│   │   └── policyConstants.ts
│   └── styles/               # Global styles
├── public/                   # Static assets
└── ...config files
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Backend API running (see backend README)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd FCT-DCIP-FRONTEND
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_API_KEY=your-api-key-from-backend

# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3001
NODE_ENV=development
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**
```
http://localhost:3001
```

## 🔐 Authentication

### Login Flow

1. User enters email and password
2. Frontend sends credentials to `/api/v1/auth/login` or `/api/v1/auth/loginEmployee`
3. Backend returns JWT token and user data
4. Frontend stores token in localStorage with appropriate key:
   - `userToken` - Regular users
   - `adminToken` - AMMC admins
   - `niaAdminToken` - NIA admins
   - `surveyorToken` - Surveyors
   - `superAdminToken` - Super admins

### Token Management

The `auth.ts` utility provides:
- `getAuthToken(tokenType?)` - Retrieve token
- `setAuthToken(token, tokenType)` - Store token
- `removeAuthToken(tokenType?)` - Remove token
- `isAuthenticated()` - Check auth status
- `decodeToken(token?)` - Decode JWT payload

### Protected Routes

All dashboard routes are protected and require authentication:
- `/dashboard/*` - User routes
- `/admin/*` - AMMC admin routes
- `/nia-admin/*` - NIA admin routes
- `/surveyor/*` - Surveyor routes

## 📱 User Interfaces

### 1. User Dashboard

**Features:**
- View policy requests
- Submit new policy requests
- Track survey progress
- View and download reports
- Manage profile

**Key Components:**
- `PolicyRequestForm` - Create policy requests
- `PolicyDetailsWithDualSurveyor` - View policy details
- `DualSurveyorProgress` - Track dual survey progress
- `MergedReportDetailsModal` - View report details
- `ReportProcessingStatus` - Track report status

### 2. AMMC Admin Dashboard

**Features:**
- Manage AMMC surveyors
- Assign surveyors to policies
- View all policy requests
- Monitor dual assignments
- Review survey submissions
- Manage merged reports

**Key Components:**
- `AdminDashboard` - Overview and statistics
- `SurveyorManagement` - Manage surveyors
- `AMMCAssignmentManagement` - Assign AMMC surveyors
- `PolicyManagement` - Manage policies
- `DualAssignmentsList` - View dual assignments

### 3. NIA Admin Dashboard

**Features:**
- Manage NIA surveyors
- Assign NIA surveyors to policies
- View dual assignments
- Monitor survey progress
- Review submissions

**Key Components:**
- `NIADashboard` - Overview and statistics
- `NIASurveyorManagement` - Manage NIA surveyors
- `NIAAssignmentManagement` - Assign NIA surveyors
- `NIADualAssignmentOverview` - View assignments

### 4. Surveyor Dashboard

**Features:**
- View assigned surveys
- Access property details
- Submit survey reports
- Upload documents and photos
- Track dual survey coordination
- View submission history

**Key Components:**
- `EnhancedSurveyorDashboard` - Overview
- `AssignmentDetail` - Assignment details
- `SurveySubmissionForm` - Submit surveys
- `SurveySubmissionModal` - Alternative submission
- `DualAssignmentCoordination` - Coordinate with other surveyor
- `PhotoCapture` - Capture and upload photos

## 🎨 UI Components

### Reusable Components

**Form Components:**
- `Input` - Text input with validation
- `Select` - Dropdown select
- `Textarea` - Multi-line text input
- `Button` - Styled button with variants

**Data Display:**
- `Card` - Content container
- `Badge` - Status indicators
- `Alert` - Notifications and messages
- `Table` - Data tables with sorting

**File Upload:**
- `FileUploadZone` - Drag-and-drop file upload
- `PhotoCapture` - Camera capture and upload
- `DocumentManager` - Manage uploaded documents

**Modals:**
- `Modal` - Base modal component
- `ConfirmDialog` - Confirmation dialogs
- `AlertDialog` - Alert dialogs

## 🔄 API Integration

### API Client (`services/api.ts`)

The API client provides:
- Automatic token injection
- Request/response interceptors
- Error handling
- Type-safe API calls

**Example Usage:**
```typescript
import { userReportAPI } from '@/services/api';

// Get user reports
const response = await userReportAPI.getUserReports(page, limit);

// Get report summary
const summary = await userReportAPI.getReportSummary();

// Download report
const report = await userReportAPI.downloadReport(reportId);
```

### API Functions

**Authentication:**
- `loginUser(email, password)`
- `loginEmployee(email, password)`
- `registerUser(data)`

**Policy Management:**
- `createPolicyRequest(data)`
- `getUserPolicyRequests()`
- `getPolicyRequestById(id)`
- `updatePolicyRequest(id, data)`

**Surveyor Operations:**
- `getSurveyorAssignments(filters)`
- `getSurveyorAssignmentById(id)`
- `submitSurvey(data)`
- `uploadSurveyDocument(file, data)`

**Admin Operations:**
- `getAllSurveyors(filters)`
- `createSurveyor(data)`
- `assignSurveyor(assignmentId, surveyorId)`
- `getDualAssignments(filters)`

## 📊 State Management

### Context Providers

**AuthContext:**
- Manages authentication state
- Provides login/logout functions
- Tracks current user

**Usage:**
```typescript
import { useAuth } from '@/context/useAuth';

const { user, login, logout, isAuthenticated } = useAuth();
```

### Local State

Components use React hooks for local state:
- `useState` - Component state
- `useEffect` - Side effects
- `useCallback` - Memoized callbacks
- `useMemo` - Memoized values

## 🎨 Styling

### Tailwind CSS

The application uses Tailwind CSS for styling:
- Utility-first approach
- Responsive design
- Custom color palette
- Dark mode support (optional)

**Color Scheme:**
- Primary: Green (#028835)
- Secondary: Blue (#2563eb)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Error: Red (#ef4444)

### Responsive Design

All components are responsive:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Breakpoints:**
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## 🧪 Testing

### Manual Testing

1. **User Flow:**
   - Register/Login
   - Submit policy request
   - Track survey progress
   - View and download reports

2. **Admin Flow:**
   - Login as admin
   - View policy requests
   - Assign surveyors
   - Monitor progress

3. **Surveyor Flow:**
   - Login as surveyor
   - View assignments
   - Submit surveys
   - Upload documents

### Test Accounts

Use the backend token generation script to create test accounts:
```bash
cd FCT-DCIP-BACKEND
npm run generate-tokens
```

Then use the provided credentials or tokens.

## 🐛 Debugging

### Common Issues

**1. 401 Unauthorized Errors:**
- Clear localStorage: `localStorage.clear()`
- Generate new tokens from backend
- Check token is stored correctly
- Verify API_BASE_URL is correct

**2. CORS Errors:**
- Ensure backend CORS is configured
- Check API_BASE_URL matches backend
- Verify API_KEY is correct

**3. Phone Number Validation:**
- Use format: `08012345678`, `2348012345678`, or `+2348012345678`
- Spaces and dashes are automatically removed

**4. File Upload Issues:**
- Check file size (max 10MB)
- Verify file type is allowed
- Ensure Cloudinary is configured in backend

### Browser Console

Check console for:
- API request/response logs
- Authentication status
- Error messages
- Token information

## 📦 Build & Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

### Run Production Build

```bash
npm start
# or
yarn start
```

### Environment Variables for Production

```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api/v1
NEXT_PUBLIC_API_KEY=your-production-api-key
NEXT_PUBLIC_BASE_URL=https://your-frontend-domain.com
NODE_ENV=production
```

### Deployment Platforms

**Recommended:**
- **Vercel** (Optimized for Next.js)
- **Netlify**
- **AWS Amplify**
- **DigitalOcean App Platform**

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

## 🔧 Configuration

### Next.js Config

`next.config.js`:
```javascript
module.exports = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'], // For Cloudinary images
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
}
```

### Tailwind Config

`tailwind.config.js`:
```javascript
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#028835',
        // ... custom colors
      },
    },
  },
}
```

## 📱 Progressive Web App (PWA)

The application can be configured as a PWA:
- Add `manifest.json`
- Configure service worker
- Enable offline functionality

## ♿ Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- Color contrast compliance

## 🌐 Internationalization (i18n)

Future enhancement:
- Multi-language support
- Date/time localization
- Currency formatting

## 📈 Performance Optimization

- Code splitting
- Lazy loading
- Image optimization
- Caching strategies
- Bundle size optimization

## 🔒 Security

- XSS protection
- CSRF protection
- Secure token storage
- Input sanitization
- Content Security Policy

## 📝 Code Style

### TypeScript

- Strict mode enabled
- Type safety enforced
- Interface definitions for all data structures

### ESLint

```bash
npm run lint
```

### Prettier

```bash
npm run format
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

[Your License Here]

## 👥 Contributors

[Your Team Here]

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Next.js Version:** 14.2.13
