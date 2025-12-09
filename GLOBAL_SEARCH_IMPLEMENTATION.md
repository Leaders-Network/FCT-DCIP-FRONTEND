# Global Search Implementation

## 🎯 Overview
Implemented a comprehensive global search component that provides intelligent search functionality across both user and admin dashboards with keyboard shortcuts, recent searches, and quick navigation.

## ✨ Features

### Core Features
- ✅ **Keyboard Shortcut**: Press `Cmd/Ctrl + K` to open search from anywhere
- ✅ **Real-time Search**: Debounced search with 300ms delay
- ✅ **Recent Searches**: Stores last 5 searches per user type
- ✅ **Quick Navigation**: Context-aware quick links based on user role
- ✅ **Keyboard Navigation**: Use arrow keys to navigate, Enter to select
- ✅ **Click Outside to Close**: Automatically closes when clicking outside
- ✅ **Responsive Design**: Works on mobile and desktop
- ✅ **Loading States**: Shows loading indicator during search
- ✅ **Empty States**: Helpful messages when no results found

### User-Specific Searches (User Dashboard)
- 🏠 **Properties**: Search and navigate to property management
- 📋 **Policies**: Find insurance policies
- 🛡️ **Insurance Types**: Browse insurance options
- 📊 **Dashboard**: Quick access to main dashboard

### Admin-Specific Searches (Admin Dashboard)
- 📋 **Policies**: Manage policy requests
- 👥 **Surveyors**: Surveyor management
- 📅 **Assignments**: View and manage assignments
- 👤 **Users**: User management
- 📊 **Dashboard**: Quick access to admin dashboard

## 📁 Files Created

### 1. GlobalSearch Component
**File**: `src/components/shared/GlobalSearch.tsx`
- Main search component with dropdown
- Keyboard shortcuts (Cmd/Ctrl + K)
- Recent searches management
- Quick navigation links
- Search results display

### 2. useDebounce Hook
**File**: `src/hooks/useDebounce.ts`
- Custom hook for debouncing search input
- Prevents excessive API calls
- 300ms delay for optimal UX

## 🔧 Integration

### Admin Dashboard
**File**: `src/components/admin/Header.tsx`
```tsx
<GlobalSearch userType="admin" className="..." />
```

### User Dashboard
**File**: `src/app/dashboard/_components/UserLayout.tsx`
```tsx
<GlobalSearch userType="user" className="..." />
```

## 🎨 UI/UX Features

### Search Input
- Magnifying glass icon
- Clear button (X) when typing
- Placeholder with keyboard shortcut hint
- Focus ring on active

### Dropdown Menu
- Appears below search input
- Max height with scroll
- Sections for different content types
- Hover states for results
- Selected state for keyboard navigation

### Recent Searches
- Shows last 5 searches
- Click to re-search
- Clear all button
- Stored in localStorage per user type

### Quick Navigation
- Context-aware links based on user role
- Icons for visual identification
- Subtitle descriptions
- Direct navigation on click

### Search Results
- Grouped by type (policy, property, etc.)
- Icons for each result type
- Title and subtitle
- Metadata display
- Type badge

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open search |
| `Escape` | Close search |
| `↑` | Navigate up |
| `↓` | Navigate down |
| `Enter` | Select result |

## 🔍 Search Logic

### Current Implementation
- **Quick Navigation**: Matches search query against page names
- **Fuzzy Matching**: Partial string matching
- **Context-Aware**: Different results for different user types

### Future Enhancements (TODO)
```typescript
// Add API integration for searching actual data
const searchAPI = async (query: string, userType: string) => {
  const response = await fetch(`/api/v1/search?q=${query}&type=${userType}`);
  return response.json();
};
```

## 📊 Data Structure

### SearchResult Interface
```typescript
interface SearchResult {
  id: string;              // Unique identifier
  title: string;           // Main title
  subtitle?: string;       // Optional subtitle
  type: string;            // Result type (policy, property, etc.)
  url: string;             // Navigation URL
  icon: React.ReactNode;   // Icon component
  metadata?: Record<string, string>; // Additional data
}
```

## 🎯 User Types Supported

- `user` - Regular users
- `admin` - Admin users
- `surveyor` - Surveyors
- `nia-admin` - NIA administrators
- `broker-admin` - Broker administrators

## 💾 Local Storage

### Recent Searches
- Key: `recentSearches_{userType}`
- Format: `string[]`
- Max: 5 items
- Auto-cleanup on clear

## 🚀 Usage Examples

### Basic Usage
```tsx
import GlobalSearch from '@/components/shared/GlobalSearch';

<GlobalSearch userType="user" />
```

### With Custom Styling
```tsx
<GlobalSearch 
  userType="admin" 
  className="max-w-md"
/>
```

## 🔮 Future Enhancements

### Phase 1: API Integration
- [ ] Connect to backend search API
- [ ] Search policies by number, status, owner
- [ ] Search properties by address, type
- [ ] Search users by name, email
- [ ] Search surveyors by name, license

### Phase 2: Advanced Features
- [ ] Search filters (date range, status, etc.)
- [ ] Search history with timestamps
- [ ] Trending searches
- [ ] Search suggestions/autocomplete
- [ ] Voice search
- [ ] Search analytics

### Phase 3: Performance
- [ ] Implement search caching
- [ ] Add search result pagination
- [ ] Optimize for large datasets
- [ ] Add search indexing

## 🧪 Testing

### Manual Testing
1. **Open Search**:
   - Press `Cmd/Ctrl + K`
   - Click on search input
   - Verify dropdown appears

2. **Type Query**:
   - Type "policy"
   - Verify results appear
   - Check loading state

3. **Navigate Results**:
   - Use arrow keys
   - Verify selection highlight
   - Press Enter to navigate

4. **Recent Searches**:
   - Perform a search
   - Close and reopen
   - Verify search appears in recent

5. **Quick Navigation**:
   - Open search without typing
   - Verify quick links appear
   - Click to navigate

### Keyboard Testing
- `Cmd/Ctrl + K` opens search
- `Escape` closes search
- Arrow keys navigate
- Enter selects result

### Responsive Testing
- Test on mobile (< 768px)
- Test on tablet (768px - 1024px)
- Test on desktop (> 1024px)

## 🐛 Troubleshooting

### Search not opening with Cmd/Ctrl + K
- Check if other extensions are capturing the shortcut
- Verify event listener is attached
- Check browser console for errors

### Results not appearing
- Check debounce delay (300ms)
- Verify search logic in `getQuickNavigationResults`
- Check browser console for errors

### Recent searches not saving
- Check localStorage permissions
- Verify key format: `recentSearches_{userType}`
- Check browser console for errors

## 📝 Notes

- Search is currently client-side only
- API integration needed for searching actual data
- Recent searches are stored per user type
- Maximum 5 recent searches stored
- Debounce delay is 300ms

## ✨ Success Criteria

✅ Search opens with keyboard shortcut
✅ Recent searches are saved and displayed
✅ Quick navigation links work
✅ Keyboard navigation functions
✅ Responsive on all screen sizes
✅ Integrated in both user and admin dashboards

## 🎉 Ready to Use!

The global search is now fully integrated and functional. Users can:
- Press `Cmd/Ctrl + K` to search from anywhere
- View recent searches
- Use quick navigation links
- Navigate with keyboard
- Search across the platform (once API is connected)

Next step: Connect to backend API for searching actual data!
