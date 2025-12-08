# Policy Details Modal - Survey & Documents Tab Fix

## Issue
The Survey Results and Documents tabs in the Policy Details Modal were not populating properly when viewing policy details at `/admin/dashboard/policies`.

## Root Causes

### 1. Type Mismatches
- The component was using custom `SurveyData` and `AssignmentData` interfaces that didn't match the actual API response types
- Should have been using `EnhancedSurveySubmission` and `Assignment` from `@/types/api.types`

### 2. Missing Imports
- `Assignment` type was not imported
- `getSubmissionByAssignment` function was not imported from the API service

### 3. Incorrect Status Check
- Code was checking for `'requires_more_info'` status which doesn't exist in the PolicyRequest type
- Should be `'revision_required'`

### 4. Incomplete Document Handling
- Documents tab was only looking for legacy `surveyDocument` field
- Wasn't properly handling the `documents` array from `EnhancedSurveySubmission`
- Wasn't displaying survey photos

## Fixes Applied

### 1. Updated Imports
```typescript
import { PolicyRequest, Surveyor, EnhancedSurveySubmission, Assignment } from '@/types/api.types';
import { adminApi, reviewSubmission, deletePolicyRequest, getSubmissionByAssignment } from '@/services/api';
```

### 2. Fixed State Types
```typescript
const [surveyData, setSurveyData] = useState<EnhancedSurveySubmission | null>(null);
const [assignmentData, setAssignmentData] = useState<Assignment | null>(null);
```

### 3. Enhanced Data Fetching
- Added console logging for debugging
- Fixed status check to use `'revision_required'`
- Improved error handling
- Handle both possible response structures from API

### 4. Improved Survey Tab
- Now properly displays all survey details from `EnhancedSurveySubmission`
- Shows property condition, structural assessment, risk factors, recommendations
- Displays contact log with proper formatting
- Shows final recommendation with color-coded badges

### 5. Completely Rewrote Documents Tab
Now displays:
- **Main Survey Report**: Primary document marked as `isMainReport` or `documentType === 'main_report'`
- **Legacy Survey Document**: Backward compatibility for old `surveyDocument` field
- **Supporting Documents**: All other documents with file details
- **Survey Photos**: Grid display of photos from `surveyDetails.photos`
- Proper file size formatting
- Upload timestamps
- View and Download buttons for all documents

## Document Structure Handled

### EnhancedSurveySubmission.documents[]
```typescript
{
  fileName: string;
  fileType: string;
  fileSize: number;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  category: string;
  documentType: string;
  uploadedBy: string;
  uploadedAt: string;
  isMainReport?: boolean;
}
```

### EnhancedSurveySubmission.surveyDetails.photos[]
```typescript
{
  url: string;
  description: string;
  timestamp: string;
  publicId?: string;
}
```

## Testing Checklist

- [x] Import statements fixed
- [x] Type errors resolved
- [x] Survey tab displays data correctly
- [x] Documents tab shows main report
- [x] Documents tab shows supporting documents
- [x] Documents tab shows survey photos
- [x] View/Download buttons work
- [x] Loading states work properly
- [x] Empty states display correctly
- [x] Console logging added for debugging

## API Endpoints Used

1. `adminApi.getAssignmentByAmmcId(policyId)` - Get assignment for a policy
2. `getSubmissionByAssignment(assignmentId)` - Get survey submission by assignment

## Files Modified

- `FCT-DCIP-FRONTEND/src/components/admin/PolicyManagement.tsx`

## Benefits

1. **Complete Data Display**: All survey information and documents now visible
2. **Better UX**: Proper loading and empty states
3. **Type Safety**: Using correct TypeScript types
4. **Debugging**: Console logs help track data flow
5. **Backward Compatible**: Handles both old and new document structures
6. **Photo Gallery**: Visual display of survey photos
7. **File Management**: Clear file information and download options
