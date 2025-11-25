# TypeScript Best Practices Guide

## Quick Reference for FCT-DCIP Frontend Development

### 1. Never Use `any` Type

❌ **Bad:**
```typescript
const [data, setData] = useState<any>(null);
```

✅ **Good:**
```typescript
const [data, setData] = useState<SurveyDataType | null>(null);
```

### 2. Error Handling

❌ **Bad:**
```typescript
catch (error: any) {
  console.error(error.message);
}
```

✅ **Good:**
```typescript
catch (error: unknown) {
  const err = error as { message?: string };
  console.error(err.message || 'Unknown error');
}
```

### 3. Use Existing Type Definitions

The project has comprehensive type definitions in:
- `src/types/api.types.ts` - API-related types
- `src/types/survey.types.ts` - Survey and common data types
- `src/types/component.types.ts` - Component-specific types

✅ **Import and use existing types:**
```typescript
import { PolicyRequest, Assignment } from '@/types/api.types';
import { SurveyDataType } from '@/types/survey.types';
```

### 4. Component Props

Always define prop types for components:

✅ **Good:**
```typescript
interface MyComponentProps {
  title: string;
  onClose: () => void;
  data?: SurveyDataType;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onClose, data }) => {
  // Component logic
};
```

### 5. State Management

Use proper types for useState:

✅ **Good:**
```typescript
// Simple types
const [loading, setLoading] = useState<boolean>(false);
const [count, setCount] = useState<number>(0);

// Complex types
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<PropertyType[]>([]);
```

### 6. API Response Handling

Use the ApiResponse type for API calls:

✅ **Good:**
```typescript
import { ApiResponse } from '@/types/api.types';

const fetchData = async (): Promise<ApiResponse<SurveyDataType>> => {
  const response = await api.get('/endpoint');
  return response.data;
};
```

### 7. Optional Properties

Use `?` for optional properties:

✅ **Good:**
```typescript
interface Config {
  required: string;
  optional?: number;
  nullable: string | null;
}
```

### 8. Union Types

Use union types for specific values:

✅ **Good:**
```typescript
type Status = 'pending' | 'approved' | 'rejected';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
```

### 9. Type Guards

Use type guards for runtime type checking:

✅ **Good:**
```typescript
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && '_id' in obj;
}

if (isUser(data)) {
  console.log(data._id); // TypeScript knows data is User
}
```

### 10. Utility Types

Leverage TypeScript's built-in utility types:

```typescript
// Make all properties optional
type PartialUser = Partial<User>;

// Pick specific properties
type UserBasic = Pick<User, '_id' | 'email'>;

// Omit specific properties
type UserWithoutId = Omit<User, '_id'>;

// Make properties required
type RequiredUser = Required<User>;
```

## Common Type Patterns

### 1. Form Data
```typescript
interface FormData {
  [key: string]: string | number | boolean;
}
```

### 2. Event Handlers
```typescript
type ClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void;
type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
```

### 3. Async Functions
```typescript
type AsyncFunction<T> = () => Promise<T>;
```

### 4. Generic Components
```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <>{items.map(renderItem)}</>;
}
```

## Type Definition Locations

### When to Create New Types

1. **In `api.types.ts`:**
   - API request/response types
   - Data models from backend
   - API-related interfaces

2. **In `survey.types.ts`:**
   - Survey-related data structures
   - Common application types
   - Shared data models

3. **In `component.types.ts`:**
   - Component-specific props
   - Component state types
   - UI-related types

4. **In component file:**
   - Types used only in that component
   - Local helper types
   - Component-specific enums

## Type Import Patterns

### Absolute Imports
```typescript
import { User, PolicyRequest } from '@/types/api.types';
import { SurveyDataType } from '@/types/survey.types';
```

### Inline Type Imports (for avoiding circular dependencies)
```typescript
const [data, setData] = useState<import('@/types/survey.types').SurveyDataType | null>(null);
```

## Common Mistakes to Avoid

### 1. ❌ Using `any` anywhere
```typescript
// Never do this
const data: any = fetchData();
```

### 2. ❌ Ignoring TypeScript errors
```typescript
// Never do this
// @ts-ignore
const result = unsafeOperation();
```

### 3. ❌ Not typing function parameters
```typescript
// Bad
function process(data) {
  return data.value;
}

// Good
function process(data: { value: string }): string {
  return data.value;
}
```

### 4. ❌ Using loose types
```typescript
// Bad
const config: object = {};

// Good
const config: { apiKey: string; timeout: number } = {
  apiKey: 'key',
  timeout: 5000
};
```

## IDE Configuration

### VS Code Settings
Add to `.vscode/settings.json`:
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### Recommended Extensions
- ESLint
- TypeScript Hero
- Pretty TypeScript Errors

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

## Questions?

If you're unsure about typing something:
1. Check existing type definitions in `src/types/`
2. Look for similar patterns in the codebase
3. Consult this guide
4. Ask the team for guidance

Remember: **Better types = Better code = Fewer bugs!**
