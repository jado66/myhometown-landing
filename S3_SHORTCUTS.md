# S3 Shortcuts System

## Overview

This system implements symbolic link-like functionality in S3 using metadata-based shortcuts. Shortcuts allow you to create organized collections of links to cities and communities without duplicating the actual folder structures.

## How It Works

### 1. **Shortcut Objects**

- Shortcuts are zero-byte S3 objects with a `.shortcut` extension
- They contain custom metadata pointing to target folders
- Metadata includes: `targetPath`, `displayName`, `type`, and `description`

### 2. **Metadata Structure**

```typescript
{
  shortcut: "true",
  targetPath: "Utah/Salt Lake City/Westside/",
  displayName: "Westside (Salt Lake City)",
  type: "folder",
  description: "Shortcut to Westside in Salt Lake City"
}
```

### 3. **Organization**

Shortcuts are organized in two main collections:

```
Shortcuts/
├── Cities/
│   ├── Salt Lake City.shortcut → Utah/Salt Lake City/
│   ├── Provo.shortcut → Utah/Provo/
│   ├── Ogden.shortcut → Utah/Ogden/
│   └── ...
└── Communities/
    ├── Westside (Salt Lake City).shortcut → Utah/Salt Lake City/Westside/
    ├── Central (Salt Lake City).shortcut → Utah/Salt Lake City/Central/
    ├── Pioneer Park (Provo).shortcut → Utah/Provo/Pioneer Park/
    └── ...
```

## Features

### ✅ **Dynamic Metadata**

- Shortcuts display the **size** of the target folder (calculated in real-time)
- Shortcuts show the **last modified** date of the target
- Metadata is fetched when listing files

### ✅ **Visual Indicators**

- Shortcuts display a blue link icon (🔗) next to their name
- Works in both grid and list view modes
- `.shortcut` extension is hidden in the UI

### ✅ **Navigation**

- Clicking a shortcut navigates to the target folder
- Behaves exactly like clicking the actual folder
- No duplication of data or folders

### ✅ **Organized Access**

Users can:

- Browse all cities in one place: `Shortcuts/Cities/`
- Browse all communities in one place: `Shortcuts/Communities/`
- Access any location without navigating through the hierarchy

## API Endpoints

### Generate Shortcuts

**POST** `/api/s3/generate-shortcuts`

Fetches all Utah cities and communities from the database and creates shortcuts for each.

**Response:**

```json
{
  "success": true,
  "shortcutsCreated": 24,
  "cities": 7,
  "communities": 17
}
```

### List Files (Enhanced)

**GET** `/api/s3/list?prefix=Shortcuts/Cities/`

Automatically detects shortcuts and enriches them with target metadata:

- Real-time size calculation from target folder
- Target's last modified date
- Shortcut indicator flag

## Usage

### 1. Generate Shortcuts

1. Navigate to `/admin/drive`
2. Click **"Generate Shortcuts"** button
3. Confirm the action
4. Wait for shortcuts to be created

### 2. Browse Shortcuts

Navigate to:

- `Shortcuts/Cities/` - View all city shortcuts
- `Shortcuts/Communities/` - View all community shortcuts

### 3. Use Shortcuts

- Click any shortcut to navigate to its target
- Size and date reflect the target folder's actual metadata
- Shortcut icon (🔗) indicates it's a link

## Technical Implementation

### Files Created

1. **`lib/s3-shortcuts.ts`** - Core shortcut operations

   - `createS3Shortcut()` - Create individual shortcuts
   - `getShortcutMetadata()` - Retrieve shortcut metadata
   - `createOrganizedShortcuts()` - Bulk create city/community shortcuts

2. **`app/api/s3/generate-shortcuts/route.ts`** - API endpoint

   - Fetches cities and communities from Supabase
   - Creates organized folder structure
   - Generates all shortcuts

3. **`components/storage/generate-shortcuts-button.tsx`** - UI component
   - Dialog confirmation
   - Progress feedback
   - Result display

### Files Modified

1. **`app/api/s3/list/route.ts`** - Enhanced file listing

   - Detects `.shortcut` files
   - Fetches target metadata
   - Calculates target folder size
   - Returns enriched file info

2. **`components/storage/s3-file-manager.tsx`** - Added button
3. **`components/storage/file-grid.tsx`** - Shortcut navigation & icon
4. **`components/storage/file-list.tsx`** - Shortcut navigation & icon

## Advantages

✅ **No Data Duplication** - Shortcuts are tiny metadata objects  
✅ **Real-Time Updates** - Size/date reflect current target state  
✅ **Easy Organization** - Collect related items in one place  
✅ **User-Friendly** - Intuitive navigation experience  
✅ **Scalable** - Works with any number of shortcuts

## Limitations

⚠️ **S3 Native Support** - S3 doesn't natively support symlinks  
⚠️ **Performance** - Each shortcut requires metadata lookup  
⚠️ **Navigation** - Currently navigates to folder name (not full path)

## Future Enhancements

1. **Full Path Navigation** - Navigate to exact nested paths
2. **Custom Shortcuts** - Allow users to create their own shortcuts
3. **Shortcut Management** - Edit, delete, and organize shortcuts
4. **Bulk Operations** - Apply actions to shortcut targets
5. **Favorites** - Pin frequently accessed shortcuts
6. **Search** - Find shortcuts by name or target

## Example Use Cases

### City Administrators

- Quick access to all city folders without drilling down
- Organized view of all available cities

### Community Managers

- Browse all communities regardless of city
- Access specific community folders directly
- Find communities by name without knowing the city

### Content Managers

- Organized shortcuts to frequently accessed locations
- Quick navigation to upload media to specific communities
