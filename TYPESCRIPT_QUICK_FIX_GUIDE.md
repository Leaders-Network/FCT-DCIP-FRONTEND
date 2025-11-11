# TypeScript Quick Fix Guide

## Common Type Issues and Solutions

### 1. Missing Interface Properties

**Error:** `Property 'X' does not exist on type 'Y'`

**Solution:** Add the missing property to the interface in `src/types/api.types.ts`

```typescript
export interface Surveyor extends Employee {
  // Add missing properties
  experience?: number;
  maxAssignments?: number;
  qualifications?: string[];
}
```

### 2. Implicit 'any' Types

**Error:** `Parameter 'X' implicitly has an 'any' type`

**Solution:** Add explicit type annotations

```typescript
// ❌ Bad
array.map((item, index) => ...)

// ✅ Good
array.map((item: string, index: number) => ...)
```

### 3. Missing Filter Properties

**Error:** `Object literal may only specify known properties`

**Solution:** Add the property to the filter interface

```typescript
export interface SurveyorFilters {
  status?: string;
  organization?: string; // Add missing filter
}
```

### 4. Type Assertions

When you know the type but TypeScript doesn't:

```typescript
// Use type assertion
const input = e.target as HTMLInputElement;
const value = input.value;
```

### 5. Optional Chaining

For potentially undefined values:

```typescript
// ✅ Safe access
surveyor?.qualifications?.length
surveyor.userId?.email
```

### 6. Union Types for Status

Use union types for strict status values:

```typescript
type Status = 'active' | 'inactive' | 'suspended';
type Availability = 'available' | 'busy' | 'unavailable';
```

## Type Checking Commands

```bash
# Check types without building
npm run type-check
# or
npx tsc --noEmit

# Build with type checking
npm run build

# Lint with type checking
npm run lint
```

## Quick Fixes Checklist

- [ ] All interfaces have complete property definitions
- [ ] No implicit `any` types in function parameters
- [ ] All component props properly typed
- [ ] Optional properties use `?` operator
- [ ] Union types used for status values
- [ ] Type assertions used sparingly and correctly
- [ ] Optional chaining used for nullable values

## Common Patterns

### Component Props
```typescript
interface MyComponentProps {
  data: DataType;
  onAction: (id: string) => void;
  optional?: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ data, onAction, optional }) => {
  // Component logic
};
```

### API Response Handling
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const response: ApiResponse<Surveyor[]> = await api.getSurveyors();
```

### Event Handlers
```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
};
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- Project Types: `src/types/api.types.ts`
- Component Types: `src/types/component.types.ts`
