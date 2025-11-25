# TypeScript Development Checklist

## Before Writing Code

- [ ] Review existing type definitions in `src/types/`
- [ ] Check if types can be imported from `@/types`
- [ ] Understand the component/function requirements
- [ ] Plan data structures and their types

## While Writing Code

### Component Development
- [ ] Define prop interface with all required and optional properties
- [ ] Type all state variables explicitly
- [ ] Type event handlers correctly
- [ ] Use proper React types (ReactNode, ReactElement, etc.)
- [ ] Add JSDoc comments for complex props

### Function Development
- [ ] Define parameter types
- [ ] Define return type
- [ ] Handle null/undefined cases
- [ ] Use type guards for runtime checks
- [ ] Avoid `any` type - use `unknown` if needed

### API Integration
- [ ] Define request payload types
- [ ] Define response types
- [ ] Use type guards for response validation
- [ ] Handle error cases with proper types
- [ ] Document API types with JSDoc

### State Management
- [ ] Type initial state
- [ ] Type state update functions
- [ ] Use discriminated unions for complex states
- [ ] Type action creators and reducers
- [ ] Document state shape

## Code Review Checklist

### Type Safety
- [ ] No `any` types (except intentional debug code)
- [ ] No unsafe type assertions (`as any`)
- [ ] Proper use of type guards
- [ ] Generic types used correctly
- [ ] Union types for limited value sets

### Type Definitions
- [ ] Types imported from central location
- [ ] No duplicate type definitions
- [ ] Interfaces properly extended
- [ ] Types exported when needed
- [ ] Complex types documented

### Best Practices
- [ ] Consistent naming conventions
- [ ] Proper use of `Partial`, `Required`, `Pick`, `Omit`
- [ ] Type narrowing used correctly
- [ ] Optional chaining for nullable values
- [ ] Nullish coalescing for defaults

### Documentation
- [ ] JSDoc comments for public APIs
- [ ] Complex types explained
- [ ] Examples provided for generic types
- [ ] Edge cases documented
- [ ] Type constraints explained

## Testing Checklist

### Compile-Time
- [ ] TypeScript compiler passes (`npm run type-check`)
- [ ] No TypeScript errors in IDE
- [ ] Build succeeds (`npm run build`)
- [ ] ESLint passes with TypeScript rules

### Runtime
- [ ] Type guards work correctly
- [ ] API responses match types
- [ ] Form data validates properly
- [ ] Error handling works as expected
- [ ] Edge cases handled

## Common Patterns Checklist

### Component Props
```typescript
- [ ] All props typed
- [ ] Optional props marked with `?`
- [ ] Default props documented
- [ ] Children prop typed correctly
- [ ] Event handlers typed
```

### State Management
```typescript
- [ ] Initial state typed
- [ ] State updates type-safe
- [ ] Derived state typed
- [ ] Complex state uses interfaces
- [ ] State shape documented
```

### API Calls
```typescript
- [ ] Request types defined
- [ ] Response types defined
- [ ] Error types defined
- [ ] Loading states typed
- [ ] Type guards used
```

### Forms
```typescript
- [ ] Form data interface defined
- [ ] Validation types defined
- [ ] Error types defined
- [ ] Submit handler typed
- [ ] Field types match inputs
```

## Anti-Patterns to Avoid

### ❌ Don't Do This
```typescript
// Using any
const data: any = fetchData();

// Unsafe assertion
const user = data as User;

// Ignoring errors
// @ts-ignore
const value = obj.property;

// Duplicate types
interface User { ... }
interface UserData { ... } // Same as User

// Implicit any
function process(data) { ... }
```

### ✅ Do This Instead
```typescript
// Use proper types
const data: unknown = fetchData();

// Use type guard
if (isUser(data)) {
  const user = data; // Type-safe
}

// Fix the error
const value = obj?.property ?? defaultValue;

// Reuse types
import { User } from '@/types';
type UserData = User;

// Explicit types
function process(data: ProcessData): Result { ... }
```

## Quick Reference

### Type Imports
```typescript
import { 
  User, 
  PolicyRequest, 
  Assignment,
  ApiResponse 
} from '@/types';
```

### Type Guards
```typescript
if (isDefined(value)) { ... }
if (isSuccessResponse(response)) { ... }
if (isString(value)) { ... }
```

### Utility Types
```typescript
Partial<T>      // All optional
Required<T>     // All required
Pick<T, K>      // Select properties
Omit<T, K>      // Exclude properties
Record<K, V>    // Object type
```

### React Types
```typescript
React.FC<Props>           // Function component
React.ReactNode           // Any renderable
React.ReactElement        // JSX element
React.ComponentType<P>    // Component type
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- Project docs: `TYPESCRIPT_QUICK_GUIDE.md`
- Type definitions: `src/types/`

## Getting Help

1. Check `TYPESCRIPT_QUICK_GUIDE.md`
2. Review `TYPESCRIPT_FIXES_APPLIED.md`
3. Search type definitions in `src/types/`
4. Use IDE autocomplete and hover
5. Ask team members
6. Check TypeScript documentation

---

**Remember**: Good types make code self-documenting and prevent bugs!
