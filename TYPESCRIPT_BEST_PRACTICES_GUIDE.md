# TypeScript Best Practices Guide for FCT-DCIP

## Overview
This guide outlines the TypeScript best practices implemented in the FCT-DCIP project and provides guidelines for maintaining type safety.

## Type Definition Standards

### 1. Interface vs Type
**Use interfaces for:**
- Object shapes
- Component props
- API responses
- Extendable types

```typescript
// ✅ Good
export interface UserProps {
  name: string;
  email: string;
}

// ✅ Good - extending
export interface AdminProps extends UserProps {
  role: string;
}
```

**Use types for:**
- Union types
- Intersection types
- Mapped types
- Utility types

```typescript
// ✅ Good
export type Status = 'pending' | 'approved' | 'rejected';
export type Optional<T> = T | null | undefined;
```

### 2. Avoid 'any' Type
**Never use 'any'** - it defeats the purpose of TypeScript

```typescript
// ❌ Bad
function processData(data: any) {
  return data.value;
}

// ✅ Good
function processData<T extends { value: unknown }>(data: T) {
  return data.value;
}

// ✅ Better - with specific type
interface DataWithValue {
  value: string | number;
}

function processData(data: DataWithValue) {
  return data.value;
}
```

### 3. Proper Null Handling
Always handle null/undefined explicitly

```typescript
// ❌ Bad
function getName(user: User) {
  return user.profile.name; // Can crash if profile is undefined
}

// ✅ Good
function getName(user: User) {
  return user.profile?.name ?? 'Unknown';
}

// ✅ Better - with type guard
function getName(user: User): string {
  if (!user.profile?.name) {
    return 'Unknown';
  }
  return user.profile.name;
}
```

### 4. Generic Types
Use generics for reusable, type-safe code

```typescript
// ✅ Good - API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Usage
const userResponse: ApiResponse<User> = await fetchUser();
const policyResponse: ApiResponse<PolicyRequest> = await fetchPolicy();
```

### 5. Type Guards
Implement type guards for runtime type checking

```typescript
// ✅ Good - type guard
export function isApiSuccess<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true && response.data !== undefined;
}

// Usage
const response = await api.get('/data');
if (isApiSuccess(response)) {
  // TypeScript knows response.data exists here
  console.log(response.data);
}
```

## Component Typing

### 1. React Component Props
Always define explicit prop interfaces

```typescript
// ✅ Good
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled = false,
  variant = 'primary'
}) => {
  return (
    <button onClick={onClick} disabled={disabled} className={variant}>
      {label}
    </button>
  );
};
```

### 2. Event Handlers
Type event handlers properly

```typescript
// ✅ Good
interface FormProps {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// ✅ Good - with custom data
interface CustomEvent {
  value: string;
  isValid: boolean;
}

interface FormProps {
  onCustomChange: (data: CustomEvent) => void;
}
```

### 3. State Typing
Always type useState explicitly when not obvious

```typescript
// ✅ Good - explicit type
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState<boolean>(false);
const [errors, setErrors] = useState<Record<string, string>>({});

// ✅ Good - inferred type is clear
const [count, setCount] = useState(0); // number
const [name, setName] = useState(''); // string
```

## API Integration

### 1. Request/Response Types
Define clear types for all API interactions

```typescript
// ✅ Good - request type
export interface CreatePolicyRequest {
  propertyDetails: PropertyDetails;
  contactDetails: ContactDetails;
  requestDetails: RequestDetails;
}

// ✅ Good - response type
export interface CreatePolicyResponse {
  success: boolean;
  policy: PolicyRequest;
  message: string;
}

// ✅ Good - API function
export async function createPolicy(
  data: CreatePolicyRequest
): Promise<CreatePolicyResponse> {
  const response = await api.post('/policy', data);
  return response.data;
}
```

### 2. Error Handling
Type errors properly

```typescript
// ✅ Good - error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationError extends ApiError {
  field: string;
  constraint: string;
}

// ✅ Good - error handling
try {
  const result = await api.post('/data', payload);
  return result;
} catch (error) {
  if (isApiError(error)) {
    console.error('API Error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
  throw error;
}
```

## Advanced Patterns

### 1. Discriminated Unions
Use discriminated unions for complex state

```typescript
// ✅ Good - discriminated union
type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: string };

function handleState(state: LoadingState) {
  switch (state.status) {
    case 'idle':
      return 'Not started';
    case 'loading':
      return 'Loading...';
    case 'success':
      return `Welcome ${state.data.name}`; // data is available
    case 'error':
      return `Error: ${state.error}`; // error is available
  }
}
```

### 2. Utility Types
Leverage TypeScript utility types

```typescript
// ✅ Good - using utility types
type PartialUser = Partial<User>; // All properties optional
type RequiredUser = Required<User>; // All properties required
type UserKeys = keyof User; // Union of all keys
type UserValues = User[keyof User]; // Union of all value types

// ✅ Good - custom utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
```

### 3. Mapped Types
Create flexible type transformations

```typescript
// ✅ Good - mapped type
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

// Usage
type ReadonlyUser = Readonly<User>;
type NullableUser = Nullable<User>;
```

## Common Pitfalls to Avoid

### 1. Type Assertions
Avoid type assertions unless absolutely necessary

```typescript
// ❌ Bad - unsafe assertion
const user = data as User;

// ✅ Good - with validation
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    'email' in data
  );
}

const user = isUser(data) ? data : null;
```

### 2. Implicit Any
Enable strict mode to catch implicit any

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 3. Type Widening
Be aware of type widening

```typescript
// ❌ Bad - type widened to string
let status = 'pending'; // type: string
status = 'approved'; // OK, but loses specificity

// ✅ Good - explicit type
let status: 'pending' | 'approved' | 'rejected' = 'pending';
status = 'approved'; // OK
status = 'invalid'; // Error!

// ✅ Good - const assertion
const status = 'pending' as const; // type: 'pending'
```

## Testing with Types

### 1. Mock Types
Create proper mock types for testing

```typescript
// ✅ Good - mock factory
export function createMockUser(overrides?: Partial<User>): User {
  return {
    _id: 'mock-id',
    name: 'Mock User',
    email: 'mock@example.com',
    ...overrides
  };
}

// Usage in tests
const testUser = createMockUser({ name: 'Test User' });
```

### 2. Type-Safe Test Utilities
Use type-safe test utilities

```typescript
// ✅ Good - typed test helper
export function expectType<T>(value: T): void {
  // Type assertion for tests
}

// Usage
expectType<User>(result); // Compile-time check
```

## Documentation

### 1. JSDoc Comments
Add JSDoc for complex types

```typescript
/**
 * Represents a policy request in the system
 * @property {string} _id - Unique identifier
 * @property {PropertyDetails} propertyDetails - Property information
 * @property {string} status - Current status of the request
 */
export interface PolicyRequest {
  _id: string;
  propertyDetails: PropertyDetails;
  status: PolicyStatus;
}
```

### 2. Type Exports
Organize and export types properly

```typescript
// types/index.ts
export type { User, UserProps } from './user.types';
export type { Policy, PolicyRequest } from './policy.types';
export type { ApiResponse, ApiError } from './api.types';
```

## Checklist for New Code

- [ ] No 'any' types used
- [ ] All function parameters typed
- [ ] All function return types explicit
- [ ] Component props interface defined
- [ ] State variables explicitly typed when needed
- [ ] Event handlers properly typed
- [ ] API requests/responses typed
- [ ] Error handling typed
- [ ] Null/undefined handled explicitly
- [ ] Type guards implemented where needed
- [ ] Generic types used appropriately
- [ ] JSDoc added for complex types
- [ ] Types exported from appropriate files

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

## Conclusion

Following these best practices ensures:
- Type safety throughout the application
- Better IDE support and autocomplete
- Fewer runtime errors
- Easier refactoring
- Better code documentation
- Improved developer experience
