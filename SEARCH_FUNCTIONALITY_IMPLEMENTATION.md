# Search Functionality Implementation

## Summary
Implemented comprehensive search functionality across admin pages with backend support and debounced frontend inputs.

## ✅ Completed Implementations

### 1. User Conflict Inquiries (`/admin/dashboard/user-inquiries`)
**Backend:** `routes/userConflictInquiries.js`
- Searches: `referenceId`, `description`, `conflictType`
- Case-insensitive regex search
- Uses MongoDB `$or` operator

**Frontend:** `components/admin/AMMCUserConflictInbox.tsx`
- 500ms debounced search
- Separate useEffect for search vs filters
- Fixed organization filter (was filtering out all inquiries)

### 2. AMMC Surveyors (`/admin/dashboard/surveyors`)
**Backend:** `controllers/adminSurveyor.js`
- Searches: `firstname`, `lastname`, `email`, `licenseNumber`, `organization`
- Filters: `status`, `organization`, `specialization`
- Post-population filtering (since employee data is in separate collection)

**Frontend:** `components/admin/SurveyorManagement.tsx`
- 500ms debounced search
- Removed duplicate client-side filtering
- Backend now handles all filtering
- Triggers on: search term, status filter, specialization filter

## Search Implementation Pattern

### Backend Pattern:
```javascript
// For simple fields in same collection
if (search && search.trim()) {
    filter.$or = [
        { field1: { $regex: search, $options: 'i' } },
        { field2: { $regex: search, $options: 'i' } }
    ];
}

// For populated/related collections
let results = await Model.find(filter).populate('relatedField');
if (search && search.trim()) {
    const searchLower = search.toLowerCase();
    results = results.filter(item => {
        return (
            (item.field1 || '').toLowerCase().includes(searchLower) ||
            (item.relatedField?.field2 || '').toLowerCase().includes(searchLower)
        );
    });
}
```

### Frontend Pattern:
```typescript
// Main filters effect
useEffect(() => {
    fetchData();
}, [filter1, filter2]);

// Debounced search effect
useEffect(() => {
    const debounceTimer = setTimeout(() => {
        fetchData();
    }, 500);
    return () => clearTimeout(debounceTimer);
}, [searchTerm]);
```

## Pages That Need Search Implementation

### High Priority:
1. ✅ User Inquiries - DONE
2. ✅ AMMC Surveyors - DONE
3. ⏳ NIA Surveyors (`/nia-admin/surveyors`)
4. ⏳ Policies (`/admin/dashboard/policies`)
5. ⏳ Properties (`/admin/dashboard/property`)
6. ⏳ Assignments (`/admin/dashboard/assignments`)
7. ⏳ Users (`/admin/dashboard/users`)

### Medium Priority:
8. ⏳ Administrators (`/admin/dashboard/administrators`)
9. ⏳ Dual Assignments (`/admin/dashboard/dual-assignments`)
10. ⏳ Processing Monitor (`/nia-admin/processing-monitor`)

### Navbar Search:
⏳ Global search across multiple entities (requires separate implementation)

## Testing Checklist

For each search implementation:
- [ ] Search works with partial matches
- [ ] Search is case-insensitive
- [ ] Debouncing prevents excessive API calls
- [ ] Search works with other filters
- [ ] Empty search shows all results
- [ ] Special characters don't break search
- [ ] Search persists across pagination
- [ ] Loading states work correctly

## Notes

### Why Debouncing?
- Prevents API call on every keystroke
- Reduces server load
- Better user experience (waits for user to finish typing)
- 500ms is a good balance between responsiveness and efficiency

### Why Backend Search?
- More efficient (database indexes)
- Handles large datasets
- Consistent across all clients
- Can search related/populated fields
- Reduces data transfer

### Client-Side vs Server-Side Filtering
- **Server-side:** Search, pagination, complex filters
- **Client-side:** UI state, temporary filters, sorting already-loaded data
