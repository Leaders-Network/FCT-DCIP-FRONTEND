# TypeScript Quick Reference Guide

## Common Type Patterns

### 1. Component Props
```typescript
import { ReactNode } from 'react';

interface MyComponentProps {
  title: string;
  count: number;
  isActive?: boolean;  // Optional
  children?: ReactNode;
  onSubmit: (data: FormData) => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, count, children }) => {
  // Component implementation
};
```

### 2. State Management
```typescript
import { useState } from 'react';
import { User, PolicyRequest } from '@/types';

// Simple state
const [count, setCount] = useState<number>(0);
const [name, setName] = useState<string>('');

// Complex state
const [user, setUser] = useState<User | null>(null);
const [policies, setPolicies] = useState<PolicyRequest[]>([]);

// State with initial value
const [loading, setLoading] = useState(false); // Type inferred as boolean
```

### 3. API Calls
```typescript
import { ApiResponse, PolicyRequest } from '@/types';

// With proper typing
const fetchPolicies = async (): Promise<PolicyRequest[]> => {
  const response = await api.get<ApiResponse<PolicyRequest[]>>('/policies');
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error(response.data.error);
};

// With type guard
const fetchData = async () => {
  const response = await api.get('/data');
  if (isSuccessResponse(response)) {
    // response.data is properly typed
    return response.data;
  }
  throw new Error(response.error);
};
```

### 4. Event Handlers
```typescript
// Form events
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // Handle form submission
};

// Input events
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

// Button events
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  // Handle click
};

// Generic event
const handleEvent = (e: React.SyntheticEvent) => {
  // Handle any React event
};
```

### 5. Async Functions
```typescript
// Promise return type
const fetchUser = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Void async function
const updateUser = async (user: User): Promise<void> => {
  await api.put(`/users/${user._id}`, user);
};

// With error handling
const safelyFetchData = async (): Promise<User | null> => {
  try {
    return await fetchUser('123');
  } catch (error) {
    console.error(error);
    return null;
  }
};
```

### 6. Type Guards
```typescript
// Check if value is defined
if (isDefined(value)) {
  // value is not null or undefined
  console.log(value);
}

// Check response type
if (isSuccessResponse(response)) {
  // response.data is available
  console.log(response.data);
}

// Custom type guard
const isUser = (value: unknown): value is User => {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_id' in value &&
    'email' in value
  );
};
```

### 7. Union Types
```typescript
// Status union
type Status = 'pending' | 'approved' | 'rejected';

// Multiple types
type StringOrNumber = string | number;

// Nullable
type NullableUser = User | null;

// Optional
type OptionalUser = User | undefined;

// Maybe (both)
type MaybeUser = User | null | undefined;
```

### 8. Generic Components
```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}

// Usage
<List<User>
  items={users}
  renderItem={(user) => <span>{user.email}</span>}
/>
```

### 9. Utility Types
```typescript
// Partial - all properties optional
type PartialUser = Partial<User>;

// Required - all properties required
type RequiredUser = Required<User>;

// Pick - select specific properties
type UserEmail = Pick<User, 'email' | '_id'>;

// Omit - exclude specific properties
type UserWithoutId = Omit<User, '_id'>;

// Record - object with specific key/value types
type UserMap = Record<string, User>;

// Extract - extract types from union
type SuccessStatus = Extract<Status, 'approved' | 'completed'>;

// Exclude - exclude types from union
type PendingStatus = Exclude<Status, 'approved' | 'rejected'>;
```

### 10. Type Assertions
```typescript
// Use sparingly and only when necessary
const element = document.getElementById('root') as HTMLDivElement;

// Better: Type guard
const element = document.getElementById('root');
if (element instanceof HTMLDivElement) {
  // element is HTMLDivElement
}

// Non-null assertion (use carefully)
const value = getValue()!; // Asserts value is not null/undefined
```

## Common Patterns

### Form Handling
```typescript
interface FormData {
  email: string;
  password: string;
  remember?: boolean;
}

const [formData, setFormData] = useState<FormData>({
  email: '',
  password: '',
});

const handleChange = (field: keyof FormData) => (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  setFormData(prev => ({
    ...prev,
    [field]: e.target.value
  }));
};
```

### API Response Handling
```typescript
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

const [state, setState] = useState<ApiState<User>>({
  data: null,
  loading: false,
  error: null
});

const fetchData = async () => {
  setState(prev => ({ ...prev, loading: true, error: null }));
  try {
    const data = await api.get<User>('/user');
    setState({ data, loading: false, error: null });
  } catch (error) {
    setState({
      data: null,
      loading: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
```

### Modal State
```typescript
interface ModalState {
  isOpen: boolean;
  data: User | null;
}

const [modal, setModal] = useState<ModalState>({
  isOpen: false,
  data: null
});

const openModal = (user: User) => {
  setModal({ isOpen: true, data: user });
};

const closeModal = () => {
  setModal({ isOpen: false, data: null });
};
```

## Best Practices

### ✅ DO
- Use explicit types for function parameters and return values
- Use type guards for runtime type checking
- Use union types for limited sets of values
- Use interfaces for object shapes
- Use generics for reusable components
- Import types from central location (`@/types`)

### ❌ DON'T
- Use `any` type (use `unknown` if type is truly unknown)
- Use type assertions unless absolutely necessary
- Ignore TypeScript errors
- Use `@ts-ignore` or `@ts-nocheck`
- Create duplicate type definitions

## Quick Fixes

### Error: Type 'X' is not assignable to type 'Y'
```typescript
// Check if types match
// Use type assertion only if you're certain
const value = unknownValue as ExpectedType;

// Better: Use type guard
if (isExpectedType(unknownValue)) {
  // unknownValue is now ExpectedType
}
```

### Error: Object is possibly 'null' or 'undefined'
```typescript
// Use optional chaining
const value = object?.property?.nestedProperty;

// Use nullish coalescing
const value = object?.property ?? defaultValue;

// Use type guard
if (object && object.property) {
  // object.property is defined
}
```

### Error: Property 'X' does not exist on type 'Y'
```typescript
// Check if property exists in type definition
// Add property to interface if it should exist
interface MyType {
  existingProp: string;
  newProp: string; // Add this
}

// Or use type assertion if property is dynamic
const obj = value as MyType & { dynamicProp: string };
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Type Challenges](https://github.com/type-challenges/type-challenges)

## Getting Help

1. Check type definition files in `src/types/`
2. Use IDE autocomplete (Ctrl+Space)
3. Hover over types to see definitions
4. Check TypeScript compiler errors
5. Review this guide and TYPESCRIPT_FIXES_APPLIED.md
