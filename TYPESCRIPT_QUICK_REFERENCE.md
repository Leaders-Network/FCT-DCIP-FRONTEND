# TypeScript Quick Reference Guide

## Common Type Patterns in FCT-DCIP-FRONTEND

### 1. API Response Types

```typescript
// Generic API response wrapper
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Usage
const response: ApiResponse<PolicyRequest[]> = await api.get('/policies');
```

### 2. Component Props

```typescript
// Basic component props
interface MyComponentProps {
  title: string;
  onClose: () => void;
  data?: SomeType;
  children?: React.ReactNode;
}

// With generic
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}
```

### 3. State Management

```typescript
// Simple state
const [loading, setLoading] = useState<boolean>(false);

// Complex state
const [user, setUser] = useState<User | null>(null);

// Array state
const [items, setItems] = useState<PolicyRequest[]>([]);
```

### 4. Event Handlers

```typescript
// Form events
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // ...
};

// Input events
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

// Button events
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // ...
};
```

### 5. Async Functions

```typescript
// API calls
const fetchData = async (): Promise<ApiResponse<DataType>> => {
  try {
    const response = await api.get('/endpoint');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// With error handling
const saveData = async (data: FormData): Promise<void> => {
  try {
    await api.post('/save', data);
  } catch (error) {
    console.error('Save failed:', error);
  }
};
```

### 6. Union Types

```typescript
// Status types
type Status = 'pending' | 'approved' | 'rejected';

// Multiple types
type StringOrNumber = string | number;

// Discriminated unions
type Result = 
  | { success: true; data: DataType }
  | { success: false; error: string };
```

### 7. Optional Properties

```typescript
interface Config {
  required: string;
  optional?: number;
  nullable: string | null;
}

// Usage with optional chaining
const value = config?.optional ?? defaultValue;
```

### 8. Type Guards

```typescript
// Type guard function
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'email' in obj;
}

// Usage
if (isUser(data)) {
  console.log(data.email); // TypeScript knows data is User
}
```

### 9. Generics

```typescript
// Generic function
function getFirst<T>(array: T[]): T | undefined {
  return array[0];
}

// Generic interface
interface Container<T> {
  value: T;
  getValue: () => T;
}
```

### 10. Utility Types

```typescript
// Partial - make all properties optional
type PartialUser = Partial<User>;

// Pick - select specific properties
type UserBasic = Pick<User, 'id' | 'email'>;

// Omit - exclude specific properties
type UserWithoutPassword = Omit<User, 'password'>;

// Record - create object type
type StatusMap = Record<string, boolean>;
```

## Common Patterns in This Project

### 1. Policy Request Handling

```typescript
const [policy, setPolicy] = useState<PolicyRequest | null>(null);

const fetchPolicy = async (id: string): Promise<void> => {
  const response = await api.get<PolicyRequest>(`/policy/${id}`);
  if (response.success && response.data) {
    setPolicy(response.data);
  }
};
```

### 2. Surveyor Management

```typescript
interface SurveyorFormData {
  firstname: string;
  lastname: string;
  email: string;
  specializations: string[];
  status: 'active' | 'inactive' | 'suspended';
}

const handleCreateSurveyor = async (data: SurveyorFormData): Promise<void> => {
  await adminApi.createSurveyor(data);
};
```

### 3. Assignment Handling

```typescript
const [assignments, setAssignments] = useState<Assignment[]>([]);

const updateAssignmentStatus = async (
  id: string,
  status: Assignment['status']
): Promise<void> => {
  await api.patch(`/assignment/${id}`, { status });
};
```

### 4. Report Viewing

```typescript
interface ReportViewerProps {
  reportId: string;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ reportId }) => {
  const [report, setReport] = useState<ReportDetails | null>(null);
  // ...
};
```

### 5. Broker Admin Claims

```typescript
const [claims, setClaims] = useState<BrokerPolicyRequest[]>([]);

const updateClaimStatus = async (
  claimId: string,
  status: 'under_review' | 'rejected' | 'completed',
  notes?: string
): Promise<void> => {
  await brokerAdminAPI.updateClaimStatus(claimId, { status, notes });
};
```

## Type Import Patterns

```typescript
// Import specific types
import { User, PolicyRequest, Assignment } from '@/types/api.types';

// Import type only (no runtime)
import type { ComponentProps } from '@/types/component.types';

// Import with alias
import { ApiResponse as Response } from '@/types/api.types';
```

## Common Mistakes to Avoid

### ❌ Don't Use `any`
```typescript
// Bad
const data: any = await fetchData();

// Good
const data: DataType = await fetchData();
```

### ❌ Don't Ignore Null/Undefined
```typescript
// Bad
const name = user.name; // Error if user is null

// Good
const name = user?.name ?? 'Unknown';
```

### ❌ Don't Use Type Assertions Unnecessarily
```typescript
// Bad
const value = data as string;

// Good - use type guards
if (typeof data === 'string') {
  const value = data;
}
```

### ❌ Don't Forget Return Types
```typescript
// Bad
async function fetchData() {
  return await api.get('/data');
}

// Good
async function fetchData(): Promise<ApiResponse<DataType>> {
  return await api.get('/data');
}
```

## Best Practices

### ✅ Use Strict Types
```typescript
// Good - specific types
type Status = 'pending' | 'approved' | 'rejected';

// Avoid - too loose
type Status = string;
```

### ✅ Use Optional Chaining
```typescript
// Good
const email = user?.profile?.email ?? 'no-email';

// Avoid
const email = user && user.profile && user.profile.email || 'no-email';
```

### ✅ Use Type Guards
```typescript
// Good
if (isApiSuccessResponse(response)) {
  console.log(response.data);
}

// Avoid
if (response.success) {
  console.log((response as any).data);
}
```

### ✅ Use Const Assertions
```typescript
// Good
const config = {
  mode: 'production',
  port: 3000
} as const;

// config.mode is 'production', not string
```

## Quick Tips

1. **Hover for Types**: Hover over variables in VS Code to see their types
2. **Go to Definition**: Cmd/Ctrl + Click to jump to type definitions
3. **Auto-Import**: VS Code can auto-import types
4. **Type Checking**: Run `npm run type-check` to check all types
5. **IntelliSense**: Use Ctrl+Space for type suggestions

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- Project Type Definitions: `src/types/`

---

**Last Updated:** November 24, 2025
**Project:** FCT-DCIP-FRONTEND
