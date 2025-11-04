# Report Builder - New Features Summary

## Overview

Added drag-and-drop column ordering, debounced performance optimization, and report metadata preview to the Report Builder application.

## New Features

### 1. Drag-and-Drop Column Ordering (DnD Kit)

- **Intuitive drag-and-drop**: Grab the ⋮⋮ icon to drag columns into your preferred order
- **Visual feedback**: Columns show semi-transparent while dragging
- **Position numbers**: Selected columns display their order (1. column_name, 2. other_column, etc.)
- **Separated selected/unselected columns**: Selected columns appear first (with drag handles), unselected columns appear below (slightly dimmed)
- **Column ordering preserved**: The order you set is maintained in:
  - Preview table display
  - CSV exports
  - PDF exports
  - Saved templates/queries
- **Accessibility**: Supports both mouse/touch dragging and keyboard navigation

### 2. Performance Optimization (Debouncing)

- **500ms debounce** on column selection, filters, sorts, and related selections
- Prevents excessive API calls while you're making changes
- Smooth user experience without lag or slowdown
- Loading indicator shows when data is being fetched

### 3. Metadata Preview in Data Preview

- **Live preview**: See how your metadata will appear in exports
- **Header section**: Displays above the data table with professional formatting
  - Report header in uppercase with subtle styling
  - Report title in bold, prominent text
  - Description in readable paragraph format
- **Conditional display**: Metadata only shows if at least one field is filled
- **Matches export format**: Preview looks similar to actual PDF/CSV exports

### 4. Report Metadata

Added a new "Report Metadata" card with three customizable fields:

#### Report Title

- Main title that appears at the top of exported reports
- Example: "Q4 2024 Volunteer Activity Report"

#### Report Header

- Organization or department name shown above the title
- Example: "MyHometown Community Services"

#### Description

- Multi-line text field for additional context or summary
- Example: "This report summarizes volunteer activities and participation metrics for the fourth quarter of 2024..."

### 5. Enhanced Exports

#### CSV Export

Metadata is added as header comments (lines starting with #):

```csv
# MyHometown Community Services
# Report: Q4 2024 Volunteer Activity Report
# Description: This report summarizes volunteer activities...
# Generated: 11/3/2025, 3:45:00 PM
# Source Table: volunteer_activity
# Total Rows: 150
# Total Columns: 8
#
id,name,activity_type,hours,created_at,...
1,John Doe,Training,4,2024-10-01,...
```

#### PDF Export

Metadata appears in a professional header section:

- Report header (uppercase, subtle styling)
- Report title (bold, prominent)
- Description (readable paragraph)
- Source table and generation timestamp
- Column/row counts

### 6. Template/Query Persistence

All saved queries now preserve:

- Column order
- Report metadata (title, header, description)
- All existing features (filters, sorts, relations, etc.)

## Modified Files

### New Dependencies

- `@dnd-kit/core` - Core drag-and-drop functionality
- `@dnd-kit/sortable` - Sortable list implementation
- `@dnd-kit/utilities` - DnD Kit utility functions
- `use-debounce` - React hook for debouncing values

### New Files

- `/components/admin/report-metadata-card.tsx` - New card component for metadata inputs

### Updated Files

- `/app/admin/reports/page.tsx` - Main report builder page

  - Added metadata state management
  - Added debounced preview loading (500ms delay)
  - Updated save/load query logic
  - Updated export handlers
  - Added metadata preview display in Data Preview card

- `/components/admin/columns-card.tsx` - Column selection component

  - Implemented DnD Kit drag-and-drop
  - Created `SortableColumnItem` component for draggable columns
  - Visual separation of selected/unselected columns
  - Position numbering for selected columns
  - Grip handle (⋮⋮) for dragging

- `/components/admin/report-templates-card.tsx` - Template interface

  - Updated `TemplateInfo` interface to include metadata fields

- `/lib/export/csv.ts` - CSV export utility

  - Added metadata parameter
  - Added header comment generation

- `/components/pdf.tsx` - PDF export component
  - Added metadata parameter
  - Enhanced header layout with metadata fields
  - New styles for report header and description

## Usage

### Column Ordering

1. Select columns from the "Columns" card
2. **Drag and drop** columns using the ⋮⋮ grip handle to reorder them
3. Alternatively, use keyboard navigation for accessibility
4. The order will be reflected in the preview and all exports

### Metadata Preview

1. Fill in the "Report Metadata" card fields (optional)
2. **Live preview** appears immediately above the data table
3. See exactly how your header, title, and description will look in exports
4. Adjust metadata as needed based on the preview

### Report Metadata

1. Fill in the "Report Metadata" card fields:
   - Report Title (optional)
   - Report Header (optional)
   - Description (optional)
2. Metadata automatically appears in CSV and PDF exports
3. Metadata is saved with templates/queries for reuse

### Best Practices

- **Drag columns** to group related fields together (e.g., ID columns first, then descriptive fields, then metrics)
- Add descriptive titles to make reports self-explanatory
- Use the header field for branding (organization name)
- Use descriptions to explain the purpose, scope, or context of the report
- **Preview before exporting** - check the metadata preview to ensure formatting looks good
- The 500ms debounce means you can make rapid changes without waiting for each update

## Technical Details

### Performance

- **Debouncing**: All column, filter, sort, and relation changes are debounced by 500ms
- This prevents excessive API calls and improves responsiveness
- Users can make multiple quick changes without triggering multiple data fetches
- Loading state provides feedback during debounce period

### Drag and Drop

- Uses `@dnd-kit` library for accessible, performant drag-and-drop
- Supports both pointer (mouse/touch) and keyboard sensors
- Visual feedback during drag (semi-transparent item, highlighted drop zone)
- Auto-scrolling when dragging near edges

### State Management

New state variables added:

- `reportTitle: string`
- `reportHeader: string`
- `reportDescription: string`

Debounced state:

- `debouncedSelectedColumns` - 500ms delay
- `debouncedFilters` - 500ms delay
- `debouncedSorts` - 500ms delay
- `debouncedRelatedSelections` - 500ms delay

### Column Ordering Implementation

- Columns maintain their order in the `selectedColumns` array
- DnD Kit handles the drag-and-drop interaction
- `arrayMove` utility swaps elements in the array
- Preview and exports iterate over columns in array order
- Keyboard accessible with arrow keys and space/enter
- Arrow buttons swap adjacent elements in the array
- Preview and exports iterate over columns in array order

### Backward Compatibility

- All existing saved queries will work (metadata fields are optional)
- Templates without metadata will display normally
- Column ordering defaults to the order columns were selected
