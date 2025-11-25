# TypeScript Quick Fixes Reference

## Common Type Issues and Solutions

### 1. Accessing Optional Properties

❌ **Wrong**:
```typescript
const value = (obj as any).property;
```

✅ **Correct**:
```typescript
const value = typeof obj === 'object' && obj?.property || 'default';
```

### 2. Union Type Assertions

❌ **Wrong**:
```typescript
const method = value as any;
```

✅ **Correct**:
```typescript
const method = value as 'phone' | 'email' | 'sms' | 'visit';
```

### 3. Error Handling

❌ **Wrong**:
```typescript
catch (error) {
  const err = error as any;
  console.log(err.message);
}
```

✅ **Correct**:
```typescript
catch (error) {
  const err = error as { message?: string; response?: { data?: { message?: string } } };
  console.log(err.message || err.response?.data?.message);
}
```

### 4. Type Guards for Property Access

❌ **Wrong**:
```typescript
const org = (employee as any).organization;
```

✅ **Correct**:
```typescript
const org = 'organization' in employee 
  ? (employee as Employee & { organization?: string }).organization 
  : undefined;
```

### 5. Nested Object Access

❌ **Wrong**:
```typescript
const address = (submission as any).ammcId.propertyDetails.address;
```

✅ **Correct**:
```typescript
const address = typeof submission.ammcId === 'object' 
  && submission.ammcId?.propertyDetails?.address 
  || 'Address not available';
```

## Type Definition Patterns

### API Response Types

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Usage
const response: ApiResponse<BrokerPolicyRequest[]> = await api.get('/claims');
```

### Component Props

```typescript
interface ComponentProps {
  data: DataType;
  onAction: (id: string) => void;
  optional?: string;
}

const Component: React.FC<ComponentProps> = ({ data, onAction, optional }) => {
  // Component implementation
};
```

### Union Types for Status

```typescript
type Status = 'pending' | 'approved' | 'rejected';

// Instead of
const status = value as any;

// Use
const status = value as Status;
```

## Best Practices

1. **Always define interfaces for complex objects**
2. **Use union types for known string values**
3. **Implement type guards for runtime checks**
4. **Use optional chaining (?.) for nested properties**
5. **Avoid `any` - use `unknown` if type is truly unknown**

## Quick Commands

```bash
# Check for type errors
npm run type-check

# Build with type checking
npm run build

# Run linter
npm run lint
```

## Common Patterns in This Project

### Broker Admin Types
```typescript
import type {
  BrokerPolicyRequest,
  BrokerClaimFilters,
  BrokerStatusUpdateRequest
} from '@/types/api.types';
```

### API Calls
```typescript
const response = await brokerAdminAPI.getClaims(filters);
if (response.success) {
  setClaims(response.claims);
}
```

### Error Handling
```typescript
try {
  const result = await apiCall();
} catch (err) {
  const error = err as { message?: string };
  setError(error.message || 'Unknown error');
}
```

---

**Remember**: Type safety helps catch bugs at compile time, not runtime!
