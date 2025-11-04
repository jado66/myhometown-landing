# Report Builder - Mixed Column Ordering & Improvements

## ✅ Completed Enhancements

### 1. **Mixed Column Ordering**
Now you can drag and reorder **both main table columns AND related table columns** together in a single unified list!

**Before:**
- Main columns could only be reordered separately
- Related columns appeared after all main columns
- No way to mix them together

**After:**
- All selected columns (main + related) appear in one draggable list
- Drag any column to any position - main or related
- Column order is preserved exactly as arranged
- Example order: `id, users.name, title, users.email, created_at`

**Technical Implementation:**
- `selectedColumns` array now stores both types: `["id", "users.name", "title", "users.email"]`
- Related columns use dot notation: `tableName.columnName`
- Single DnD context handles all columns
- `displayedColumns` = `selectedColumns` (no more separate concatenation)

### 2. **Auto-Deselect ID Columns**
ID columns are now automatically excluded from initial selection to improve user experience.

**Logic:**
- Columns named exactly `"id"` → excluded
- Columns ending with `"_id"` → excluded (e.g., `user_id`, `category_id`)
- All other columns → selected by default

**Benefits:**
- Cleaner initial reports
- Users don't need to manually deselect IDs
- IDs can still be manually added if needed

### 3. **Friendly Date Formatting**
Dates now display in a human-readable format instead of ISO timestamps.

**Before:**
```
2025-10-31T15:49:41.500076+00:00
```

**After:**
```
Oct 31, 2025 3:49 PM
```

**Features:**
- Automatically detects ISO date strings
- Formats using locale-specific readable format
- Includes month (short), day, year, time with AM/PM
- Falls back to original value if not a date
- Works in preview table display

## 📝 Updated Files

### `app/admin/reports/page.tsx`
- Added `formatDateValue()` function for date formatting
- Updated auto-column selection to exclude ID columns
- Changed `displayedColumns` to use `selectedColumns` directly
- Updated `toggleRelatedColumn` to add/remove from main `selectedColumns` array
- Simplified `selectableColumns` logic
- Applied date formatting in table cell rendering

### `components/admin/columns-card.tsx`
- Combined main and related columns into single DnD sortable list
- All selected columns now draggable together
- Updated `toggleRelatedColumn` to work with unified column array
- Separated unselected columns by type (main vs related)
- Added "(Related)" label to related table sections

## 🎯 User Experience

### Mixed Column Ordering Example
User can now create this exact order:
```
1. ⋮⋮ ☑ id
2. ⋮⋮ ☑ users.name          [Related column!]
3. ⋮⋮ ☑ title
4. ⋮⋮ ☑ users.email         [Related column!]
5. ⋮⋮ ☑ created_at
6. ⋮⋮ ☑ categories.name     [Related column!]
```

Just drag any column (main or related) to any position!

### Auto-Selection Behavior
When selecting a table with these columns:
```
id, user_id, name, email, category_id, created_at
```

**Auto-selected:**
- `name`
- `email`
- `created_at`

**Not selected (IDs):**
- `id`
- `user_id`
- `category_id`

Users can still manually check IDs if needed.

### Date Display
| Column Type | Raw Value | Displayed Value |
|-------------|-----------|-----------------|
| Timestamp | `2025-10-31T15:49:41.500076+00:00` | `Oct 31, 2025 3:49 PM` |
| Date only | `2025-10-31` | `Oct 31, 2025 12:00 AM` |
| String | `"Hello"` | `Hello` |
| Number | `42` | `42` |
| Null | `null` | *null* (italic) |

## 🔧 Technical Notes

### Column Storage Format
```typescript
// selectedColumns array now contains mixed types:
selectedColumns = [
  "id",              // Main table column
  "title",           // Main table column
  "users.name",      // Related table column (dot notation)
  "users.email",     // Related table column
  "created_at"       // Main table column
]
```

### Column Identification
```typescript
const isRelated = columnPath.includes(".");

if (isRelated) {
  const [tableName, columnName] = columnPath.split(".");
  // Handle related column
} else {
  // Handle main table column
}
```

### Date Detection Regex
```typescript
const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
// Matches: YYYY-MM-DDTHH:MM:SS...
```

## 🎨 Benefits

1. **More Flexible Reports**: Mix main and related columns in any order
2. **Better Defaults**: No IDs cluttering reports by default
3. **Readable Dates**: Users see "Oct 31, 2025 3:49 PM" instead of ISO timestamps
4. **Consistent UX**: Same drag-and-drop experience for all columns
5. **Preserved Order**: Exact column order maintained in previews and exports

## 🚀 Example Use Cases

### Sales Report
```
1. Invoice Number
2. customers.name         [Related - Customer name]
3. customers.email        [Related - Customer email]
4. Amount
5. Created At             [Formatted as "Nov 3, 2025 2:30 PM"]
6. Status
```

### Volunteer Activity
```
1. Activity Type
2. volunteers.name        [Related - Volunteer name]
3. Hours
4. Event Date             [Formatted as "Oct 15, 2025 9:00 AM"]
5. volunteers.email       [Related - Contact]
```

### User Directory
```
1. Name
2. Email
3. departments.name       [Related - Department]
4. roles.title           [Related - Job title]
5. Created At            [Formatted date]
```

All with full drag-and-drop reordering! 🎉
