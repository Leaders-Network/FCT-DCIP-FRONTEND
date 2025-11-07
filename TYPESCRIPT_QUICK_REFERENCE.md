# TypeScript Quick Reference Guide

## 🚀 Quick Start

### Import Types
```typescript
// API types
import { PolicyRequest, Assignment, Surveyor, ApiResponse } from '@/types/api.types';

// Component types
import { AssignmentManagementProps, SurveySubmissionData } from '@/types/component.types';

// Type guards
import { isApiSuccessResponse, isDefined, filterDefined } from '@/utils/typeGuards';
```

## 📦 Common Type Patterns

### 1. API Response Handling
```typescript
import { userReportAPI } from '@/services/api';
import { isApiSuccessResponse } from '@/utils/typeGuards';

const fetchReports = async () => {
  const response = await userReportAPI.getUserReports(1, 10);
  
  if (isApiSuccessResponse(response)) {
    // TypeScript knows response.data exists
    const reports = response.data.reports;
    setReports(reports);
  } else {
    // TypeScript knows response.error exists
    console.error(response.error);
  }
};
```

### 2. Component Props
```typescript
import { DualAssignment } from '@/types/api.types';

interface MyComponentProps {
  assignment: DualAssignment;
  onComplete: () => void;
  onError?: (error: string) => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ 
  assignment, 
  onComplete, 
  onError 
}) => {
  // Component implementation
};
```

### 3. State Management
```typescript
import { useState } from 'react';
import { Surveyor } from '@/types/api.types';

// Explicit type for complex state
const [surveyors, setSurveyors] = useState<Surveyor[]>([]);
const [selectedSurveyor, setSelectedSurveyor] = useState<Surveyor | null>(null);

// Inferred type for simple state
const [loading, setLoading] = useState(true); // boolean
const [error, setError] = useState<string | null>(null);
```

### 4. Type Guards
```typescript
import { isDefined, isNonEmptyString } from '@/utils/typeGuards';

// Filter out null/undefined
const validItems = items.filter(isDefined);

// Validate string
if (isNonEmptyString(input)) {
  // TypeScript knows input is a non-empty string
  processInput(input);
}
```

### 5. Safe Property Access
```typescript
import { safeGet, safeGetNested } from '@/utils/typeGuards';

// Safe property access
const email = safeGet(user, 'email'); // string | undefined

// Safe nested property access
const address = safeGetNested<string>(policy, 'propertyDetails.address');
```

## 🎯 Common Use Cases

### Fetching and Displaying Data
```typescript
import { useState, useEffect } from 'react';
import { PolicyRequest } from '@/types/api.types';
import { adminApi } from '@/services/api';
import { isApiSuccessResponse } from '@/utils/typeGuards';

const PolicyList = () => {
  const [policies, setPolicies] = useState<PolicyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getPolicies();
        
        if (isApiSuccessResponse(response)) {
          setPolicies(response.data);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {policies.map(policy => (
        <div key={policy._id}>{policy.policyNumber}</div>
      ))}
    </div>
  );
};
```

### Form Handling
```typescript
import { useState } from 'react';
import { SurveySubmissionData } from '@/types/component.types';

const SurveyForm = () => {
  const [formData, setFormData] = useState<SurveySubmissionData>({
    surveyDetails: {
      propertyCondition: '',
      structuralAssessment: '',
      riskFactors: '',
      recommendations: '',
      photos: []
    },
    surveyNotes: '',
    contactLog: [],
    recommendedAction: 'approve'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Submit formData
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};
```

### Type-Safe Event Handlers
```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const value = e.target.value as 'approve' | 'reject' | 'request_more_info';
  setRecommendedAction(value);
};

const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  // Handle click
};
```

## 📚 Type Reference

### Core Entity Types
```typescript
// User & Authentication
User, Employee, RoleType, UserRoles

// Policy & Property
PolicyRequest, CreatePolicyRequestData, PropertyDetails

// Surveyor
Surveyor, NIASurveyor, NIASurveyorForManagement

// Assignment
Assignment, DualAssignment, AssignmentStatus

// Report
UserReport, ReportDetails, MergedReport, ReportStatus

// API Response
ApiResponse<T>, ApiSuccessResponse<T>, ApiErrorResponse
```

### Component Prop Types
```typescript
// Management Components
AssignmentManagementProps, SurveyorManagementProps

// Display Components
PolicyDetailsProps, ReportDetailsProps

// Form Components
SurveySubmissionProps, SurveySubmissionData

// UI Components
ModalComponentProps, TableComponentProps<T>, FormComponentProps
```

### Utility Types
```typescript
// Type transformations
Optional<T, K>, RequiredFields<T, K>, DeepPartial<T>

// Status types
AssignmentStatus, CompletionStatus, ReleaseStatus

// ID types
UserId, PolicyId, AssignmentId, ReportId
```

## 🛠️ Type Guards Reference

### API Response Guards
```typescript
isApiSuccessResponse<T>(response): response is ApiSuccessResponse<T>
isApiErrorResponse<T>(response): response is ApiErrorResponse
```

### Entity Guards
```typescript
isPolicyRequest(value): value is PolicyRequest
isAssignment(value): value is Assignment
isDualAssignment(value): value is DualAssignment
isSurveyor(value): value is Surveyor
isNIASurveyor(value): value is NIASurveyor
isUserReport(value): value is UserReport
isMergedReport(value): value is MergedReport
```

### Validation Guards
```typescript
isNonEmptyString(value): value is string
isValidNumber(value): value is number
isValidDateString(value): value is string
isArrayOf<T>(value, guard): value is T[]
```

### Utility Guards
```typescript
hasProperty<K>(obj, key): obj is Record<K, unknown>
hasProperties<K>(obj, keys): obj is Record<K, unknown>
isNullish(value): value is null | undefined
isDefined<T>(value): value is T
isError(value): value is Error
isPromise<T>(value): value is Promise<T>
isFunction(value): value is Function
isPlainObject(value): value is Record<string, unknown>
```

### Safe Access Functions
```typescript
safeGet<T, K>(obj, key): T[K] | undefined
safeGetNested<T>(obj, path): T | undefined
assertType<T>(value, guard, errorMessage): asserts value is T
validateOrDefault<T>(value, guard, defaultValue): T
filterDefined<T>(array): T[]
```

## 💡 Best Practices

### DO ✅
- Use explicit types for function parameters and return values
- Use type guards for runtime validation
- Use union types for constrained values
- Use generic types for reusable components
- Use utility types for type transformations
- Let TypeScript infer simple types

### DON'T ❌
- Use `any` without justification
- Use type assertions without validation
- Create overly complex nested types
- Duplicate type definitions
- Ignore TypeScript errors

## 🔗 File Locations

### Type Definitions
- **API Types:** `src/types/api.types.ts`
- **Component Types:** `src/types/component.types.ts`

### Utilities
- **Type Guards:** `src/utils/typeGuards.ts`
- **Auth Utils:** `src/utils/auth.ts`

### Services
- **API Service:** `src/services/api.ts`
- **Processing Monitor:** `src/services/processingMonitor.ts`

### Documentation
- **Type Improvements:** `TYPESCRIPT_TYPE_IMPROVEMENTS.md`
- **Fixes Applied:** `TYPESCRIPT_FIXES_APPLIED.md`
- **Quick Reference:** `TYPESCRIPT_QUICK_REFERENCE.md` (this file)

## 🎓 Learning Resources

### TypeScript Handbook
- [Basic Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

### React TypeScript
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [React + TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/react.html)

## 📞 Support

For questions or issues with types:
1. Check this quick reference guide
2. Review `TYPESCRIPT_TYPE_IMPROVEMENTS.md` for detailed information
3. Check the type definition files in `src/types/`
4. Use the type guards in `src/utils/typeGuards.ts`

---

**Last Updated:** 2024
**TypeScript Version:** 5.x
**React Version:** 18.x
