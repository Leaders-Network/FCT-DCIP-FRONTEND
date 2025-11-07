# TypeScript Usage Guide

## Quick Reference

### Type Files Location
- `src/types/api.types.ts` - API types (1275 lines)
- `src/types/utility.types.ts` - Utility types (NEW)
- `src/utils/typeValidation.ts` - Validation helpers (NEW)

### API Response Pattern
```typescript
import { ApiResponse } from '@/types/utility.types';
import { isSuccessResponse } from '@/utils/typeValidation';

const response = await api.get('/data');
if (isSuccessResponse(response)) {
  const data = response.data; // Properly typed
}
```

### Component Props
```typescript
interface MyComponentProps {
  title: string;
  onClose: () => void;
  data?: DataType;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onClose, data }) => {
  // Component implementation
};
```

### Utility Types
```typescript
import { Optional, RequiredFields, DeepPartial } from '@/types/utility.types';

// Make properties optional
type UserInput = Optional<User, 'email' | 'phone'>;

// Make properties required
type CompleteUser = RequiredFields<PartialUser, 'id' | 'name'>;

// Deep partial
type PartialConfig = DeepPartial<Config>;
```

### Type Guards
```typescript
import { isDefined, isNonEmptyString, isValidEmail } from '@/utils/typeValidation';

if (isDefined(value)) {
  // value is not null/undefined
}

if (isNonEmptyString(input)) {
  // input is a non-empty string
}

if (isValidEmail(email)) {
  // email is valid
}
```

### Form Validation
```typescript
import { validateRequired, validateEmail, combineValidators } from '@/utils/typeValidation';

const emailValidator = combineValidators(
  validateRequired,
  validateEmail
);

const error = emailValidator(emailInput);
```

## Best Practices

1. **Never use `any`** - Use `unknown` and type guards instead
2. **Always handle null/undefined** - Use optional chaining and nullish coalescing
3. **Use type guards** - Validate data at runtime
4. **Define explicit prop types** - No implicit types in components
5. **Use utility types** - Leverage provided utility types for common patterns

## Common Patterns

### Async State
```typescript
const [loading, setLoading] = useState<LoadingState>('idle');
const [data, setData] = useState<DataType | null>(null);
const [error, setError] = useState<string | null>(null);
```

### Event Handlers
```typescript
import { ChangeHandler, ClickHandler } from '@/types/utility.types';

const handleChange: ChangeHandler = (e) => {
  // Handle change
};

const handleClick: ClickHandler = (e) => {
  // Handle click
};
```

### API Calls
```typescript
try {
  const response = await userReportAPI.getUserReports(page, limit);
  if (response.success && response.data) {
    setReports(response.data.reports);
  }
} catch (error) {
  console.error('Error:', error);
}
```

## Resources
- See `TYPESCRIPT_IMPROVEMENTS_COMPLETED.md` for full implementation details
- Check `src/types/utility.types.ts` for all available utility types
- Check `src/utils/typeValidation.ts` for all validation helpers
