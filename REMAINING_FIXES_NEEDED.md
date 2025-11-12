# Remaining TypeScript Fixes Needed

## Progress: 79 errors → Continue fixing

### Recently Fixed (Latest Batch):
1. ✅ AdminContactInfo - Made organization required
2. ✅ EmployeeLoginResponse - Added organization and surveyorInfo properties
3. ✅ ReportDetails - Made several properties optional
4. ✅ ContactManagementHub - Fixed admin contact organization defaults
5. ✅ EnhancedSurveyorDashboard - Fixed DualAssignment import and DualAssignmentInfo interface
6. ✅ SurveyorLogin - Fixed error type handling
7. ✅ SurveySubmissionModal - Added ContactLogEntry import
8. ✅ MergedReportsSummary - Fixed undefined data and finalRecommendation
9. ✅ MergedReportDetailsModal - Fixed response type assertions
10. ✅ ReportViewer - Fixed undefined data handling

### Still Need Fixing:

#### Property Access Issues (Need Backend Schema Check):
1. **PolicyRequestForm.tsx:125** - `property.phonenumber` doesn't exist
2. **PropertyDetailsModal.tsx:38-40** - Missing `category`, `phonenumber`, `status` properties
3. **ReportSection.tsx:256** - Missing `reportId` property
4. **AdminLayout.tsx:316-317** - `subItem.path` should be `subItem.href`

#### Type Mismatches:
5. **PolicyDetailsWithDualSurveyor.tsx:130** - `API_BASE_URL` not defined
6. **PolicyDetailsWithDualSurveyor.tsx:172** - Type '25' not assignable to '0 | 50 | 100'
7. **AdminSideBar.tsx:33** - Missing `roleId` and `statusId` in form data
8. **AssignmentDetail.tsx:4** - Import `SurveySubmissionData` from component.types
9. **AssignmentDetail.tsx:60** - DualAssignmentInfo type mismatch
10. **AssignmentsList.tsx:42-45** - Property access on empty object `{}`
11. **AssignmentsList.tsx:410** - Missing `assignment` property
12. **SurveyorDashboard.tsx:75** - DualAssignment type not found
13. **SurveySubmissionForm.tsx:59** - `otherSurveyor` property doesn't exist
14. **SurveySubmissionForm.tsx:661** - Boolean type mismatch with empty string

#### Possibly Undefined Issues:
15. **EnhancedPolicyDetails.tsx:71** - `markNotificationAsRead` method doesn't exist
16. **PolicyCompletion.tsx:57** - `reportsResponse.data` possibly undefined
17. **ReportSection.tsx:43** - `response.data` possibly undefined
18. **ReportViewer.tsx:530-531, 692-693** - Photo array lengths possibly undefined
19. **ReportViewer.tsx:543-544, 705-706** - Photo properties on string | ReportPhoto union

#### Missing Properties on ReportDetails:
20. **MergedReportDetailsModal.tsx:202, 217, 261, 265-266** - Missing `policyId`, `status`, `conflictResolved`, `conflictDetails`
21. **ReportViewer.tsx:188, 191, 204-205** - Same missing properties

### Quick Fix Patterns:

```typescript
// Pattern 1: Optional property access
property.phonenumber || property.phoneNumber || ''

// Pattern 2: Type assertion for complex types
response.data as ReportDetailsExtended

// Pattern 3: Null coalescing for arrays
photos?.length || 0

// Pattern 4: Type guard for union types
typeof photo === 'string' ? photo : photo.url

// Pattern 5: Default values
completionStatus: (status === 25 ? 50 : status) as 0 | 50 | 100
```

### Next Steps:
1. Check backend schema for property names (phonenumber vs phoneNumber)
2. Add missing properties to ReportDetails interface
3. Fix environment variable access (API_BASE_URL)
4. Update form data structures to match API expectations
5. Add proper type guards for union types
