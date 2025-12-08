# Property Location Fields Update

## Summary
Updated the policy request system to capture detailed property location information with separate fields for Plot Number, Cadastral Zone, and District, replacing the single address field with a more structured approach.

## Changes Made

### 1. Backend Model (`FCT-DCIP-BACKEND/models/PolicyRequest.js`)
- Added `plotNumber` (required, string)
- Added `cadastralZone` (required, string)
- Added `district` (required, string)
- Added `fullAddress` (required, string) - replaces the old single address field
- Kept `address` field for backward compatibility (optional)

### 2. Frontend Types (`FCT-DCIP-FRONTEND/src/types/api.types.ts`)
Updated the following interfaces:
- `PolicyRequest.propertyDetails`
- `CreatePolicyRequestData.propertyDetails`
- `DualAssignment.policyId.propertyDetails`
- `DualAssignment.policyDetails`
- `DualAssignmentData.policyId.propertyDetails`

All now include:
```typescript
{
  plotNumber: string;
  cadastralZone: string;
  district: string;
  fullAddress: string;
  address?: string; // Legacy field for backward compatibility
  // ... other fields
}
```

### 3. Policy Request Form (`FCT-DCIP-FRONTEND/src/components/dashboard/PolicyRequestForm.tsx`)
- Added three new input fields in Step 1 (Property Details):
  - Plot Number (required)
  - Cadastral Zone (required)
  - District (required)
- Changed "Property Address" to "Full Property Address"
- Updated form initialization to include new fields
- Updated form state management

### 4. Policy Management Component (`FCT-DCIP-FRONTEND/src/components/admin/PolicyManagement.tsx`)
- Added search capability for plot number, cadastral zone, and district
- Added three new filter fields:
  - Plot Number filter
  - Cadastral Zone filter
  - District filter
- Updated table display to show location details (Plot | Zone | District)
- Updated PolicyDetailsTab to display new location fields
- Updated search placeholder text
- Updated filter state management and clear filters function

## Benefits

1. **Better Querying**: Admins can now filter and search by specific location identifiers
2. **Structured Data**: Location information is now properly structured for database queries
3. **FCT-Specific**: Aligns with FCT (Federal Capital Territory) land administration system
4. **Backward Compatible**: Legacy `address` field maintained for existing data
5. **Enhanced Search**: More precise property location searches

## Usage Examples

### Creating a Policy Request
Users now provide:
- Plot Number: e.g., "123"
- Cadastral Zone: e.g., "A01"
- District: e.g., "Maitama"
- Full Address: e.g., "Plot 123, Cadastral Zone A01, Maitama District, Abuja"

### Searching/Filtering
Admins can:
- Search by plot number, zone, or district in the main search bar
- Use dedicated filters for each location field
- Combine location filters with other filters (property type, value, date, etc.)

## Migration Notes

For existing data:
- The `address` field is kept as optional for backward compatibility
- New submissions will have all location fields populated
- Display logic checks for `fullAddress` first, then falls back to `address`
- Backend should handle migration of existing records if needed

## Files Modified

1. `FCT-DCIP-BACKEND/models/PolicyRequest.js`
2. `FCT-DCIP-FRONTEND/src/types/api.types.ts`
3. `FCT-DCIP-FRONTEND/src/components/dashboard/PolicyRequestForm.tsx`
4. `FCT-DCIP-FRONTEND/src/components/admin/PolicyManagement.tsx`

## Testing Checklist

- [ ] Create new policy request with all location fields
- [ ] Search by plot number
- [ ] Search by cadastral zone
- [ ] Search by district
- [ ] Filter by plot number
- [ ] Filter by cadastral zone
- [ ] Filter by district
- [ ] Combine multiple filters
- [ ] View policy details modal
- [ ] Verify backward compatibility with existing data
- [ ] Test form validation for required fields
