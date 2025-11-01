# File Status Management Feature

## Overview

This feature allows you to manage file and folder visibility in the S3 file manager through a simple status system. Files and folders can be locked, hidden, or have no status at all. Hidden items can be toggled from view to reduce clutter.

## Database Schema

### Table: `file_statuses`

Located in `supabase/migrations/20250101000000_create_file_statuses.sql`

| Column   | Type | Description                       |
| -------- | ---- | --------------------------------- |
| file_key | TEXT | S3 object key (Primary key)       |
| status   | TEXT | File status: 'locked' or 'hidden' |

**Note**: The table only tracks files and folders with a status. Unlocking removes the item from the table entirely.

## How It Works

### Item States

Works the same for both files and folders:

1. **No Status** (not in database)
   - Normal item, fully visible
   - Can be locked
2. **Locked** (status = 'locked')
   - Item is tracked but visible
   - Can be hidden or unlocked
3. **Hidden** (status = 'hidden')
   - Item is not shown unless "Show Hidden" is enabled
   - Can be unhidden (reverts to locked)

### Actions

#### Lock a File or Folder

1. Right-click on a normal item (no status)
2. Select "Lock File" or "Lock Folder"
3. Item is added to database with status 'locked'
4. Item remains visible but is now tracked

#### Hide a Locked Item

1. Right-click on a locked file or folder
2. Select "Hide File" or "Hide Folder"
3. Item status changes to 'hidden'
4. Item disappears from view (unless "Show Hidden" is enabled)

#### Unhide an Item

1. Enable "Show Hidden" button in toolbar
2. Right-click on a hidden file or folder
3. Select "Unhide File" or "Unhide Folder"
4. Item status reverts to 'locked' and becomes visible

#### Unlock an Item

1. Right-click on a locked file or folder
2. Select "Unlock File" or "Unlock Folder"
3. Item is **removed from the database**
4. Item returns to normal (no status)

### Toggling Hidden Items

- Click the "Show Hidden" / "Hide Hidden" button in the toolbar
- When hidden items are hidden, only items without 'hidden' status appear
- Shortcuts are always visible (cannot be locked/hidden)

## API Endpoints

### POST `/api/s3/file-lock`

Lock a file or folder (add to database with 'locked' status)

```json
{
  "fileKey": "path/to/file.txt" // or "path/to/folder/"
}
```

### PATCH `/api/s3/file-lock`

Change item status between 'locked' and 'hidden'

```json
{
  "fileKey": "path/to/file.txt", // or "path/to/folder/"
  "status": "hidden" // or "locked"
}
```

### DELETE `/api/s3/file-lock?fileKey={fileKey}`

Unlock an item (removes from database entirely)

### GET `/api/s3/file-lock`

Get all files and folders with status

```json
{
  "files": [
    {
      "file_key": "path/to/file.txt",
      "status": "locked"
    },
    {
      "file_key": "path/to/folder/",
      "status": "hidden"
    }
  ]
}
```

## Component Updates

### `s3-file-manager.tsx`

- Added `fileStatuses` Map to track file key -> status
- Added `showHiddenFiles` state to toggle visibility
- Added `loadFileStatuses()` function to fetch all file statuses
- Added four handlers:
  - `handleLockFile()` - Set status to 'locked'
  - `handleHideFile()` - Set status to 'hidden'
  - `handleUnhideFile()` - Revert status to 'locked'
  - `handleUnlockFile()` - Remove from database
- Updated `getCurrentFiles()` to filter hidden files when toggle is off
- Added "Show Hidden" / "Hide Hidden" button in toolbar

### `file-grid.tsx` & `file-list.tsx`

- Added `onLock`, `onUnlock`, `onHide`, and `onUnhide` props
- Pass all handlers to `FileActionsMenu`

### `file-actions-menu.tsx`

- Added conditional menu items based on item status:
  - No status → "Lock File" or "Lock Folder"
  - Locked → "Hide File/Folder" and "Unlock File/Folder"
  - Hidden → "Unhide File/Folder"
- Menu items adapt text based on whether it's a file or folder
- Shortcuts cannot be locked (no lock options shown)
- Uses Eye/EyeOff icons for hide/unhide
- Uses Lock/Unlock icons for lock/unlock

## Workflow Examples

### Example 1: Lock and Hide a Folder

1. User locks a folder → Folder added to DB with status 'locked'
2. User hides the folder → Status updated to 'hidden'
3. Folder disappears from view (including all its contents)
4. User enables "Show Hidden" → Folder reappears
5. User unhides folder → Status reverts to 'locked'
6. Folder stays visible even when "Show Hidden" is disabled

### Example 2: Lock and Unlock a File

1. User locks a file → File added to DB with status 'locked'
2. User unlocks file → **File removed from DB entirely**
3. File returns to normal state (no status)

### Example 3: Organizing with Hidden Folders

1. User has old project folders they rarely need
2. Lock each folder → Status 'locked'
3. Hide each folder → Status 'hidden'
4. Main view is now clean and uncluttered
5. When needed, toggle "Show Hidden" to access old folders

## Row Level Security (RLS)

The `file_statuses` table has RLS enabled with policies that:

- Allow authenticated users to view all file statuses
- Allow authenticated users to insert, update, and delete file statuses

## Migration Instructions

1. Run the migration to create the table:

   ```bash
   # Using Supabase CLI
   supabase db push

   # Or manually run the SQL in Supabase dashboard
   ```

2. The feature will automatically work once the table is created

## Design Decisions

- **Simple schema**: Only 2 columns (file_key, status) for minimal overhead
- **No audit trail**: Removed locked_by, locked_at, updated_at for simplicity
- **Delete on unlock**: Unlocking removes the record entirely to keep the table lean
- **Two-step hide**: Must lock first, then hide (prevents accidental hiding)
- **Folders supported**: Both files and folders can be locked/hidden using the same mechanism
- **Shortcuts exempt**: Shortcuts cannot be locked to maintain quick access to important locations
