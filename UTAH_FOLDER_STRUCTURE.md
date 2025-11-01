# Utah Folder Structure Generator

## Overview

This feature automatically generates a hierarchical folder structure in S3 for all Utah cities and their communities.

## Folder Structure

```
Utah/
├── Salt Lake City/
│   ├── Westside/
│   │   └── Website Media/
│   ├── Central/
│   │   └── Website Media/
│   └── Northwest/
│       └── Website Media/
├── Provo/
│   ├── Dixon/
│   │   └── Website Media/
│   ├── South Freedom/
│   │   └── Website Media/
│   └── Pioneer Park/
│       └── Website Media/
├── Ogden/
│   ├── North/
│   │   └── Website Media/
│   ├── West/
│   │   └── Website Media/
│   └── South/
│       └── Website Media/
└── [Other Cities...]
    └── [Communities...]
        └── Website Media/
```

## How to Use

1. Navigate to the Admin Drive page (`/admin/drive`)
2. Click the "Generate Utah Folder Structure" button in the toolbar
3. Review the folder structure in the confirmation dialog
4. Click "Generate" to create all folders
5. View the results showing:
   - Number of folders created
   - List of all created folder paths
   - Any errors that occurred (if any)

## Technical Details

### API Endpoint

- **URL**: `/api/s3/generate-structure`
- **Method**: POST
- **Response**:
  ```json
  {
    "success": true,
    "foldersCreated": 28,
    "folders": ["Utah/", "Utah/Salt Lake City/", ...],
    "errors": []
  }
  ```

### Database Queries

1. Fetches all cities from Utah (state="Utah", country="USA")
2. Fetches all communities belonging to those cities
3. Creates folders for:
   - Utah (root)
   - Each city
   - Each community within each city
   - `Website Media` folder within each community

### Naming Convention

- Folder names use spaces (natural naming)
- Example: "Salt Lake City" → "Salt Lake City/"
- Example: "West Valley City" → "West Valley City/"
- Media folder is named "Website Media"

### Error Handling

- Each folder creation is wrapped in a try-catch
- Errors are logged but don't stop the overall process
- All errors are reported in the final result
- Successful folders are created even if some fail

## Files Involved

### API Route

- `app/api/s3/generate-structure/route.ts` - API endpoint that fetches data and creates folders

### Components

- `components/storage/generate-folder-structure-button.tsx` - Button component with dialog UI
- `components/storage/s3-file-manager.tsx` - Main file manager (includes the button)

### Libraries

- `lib/s3-operations.ts` - S3 operations including `createS3Folder()`
- `util/supabase-server.js` - Supabase server client

## Data Source

The script reads from your Supabase database tables:

- `cities` - Contains all cities (filtered for Utah, USA)
- `communities` - Contains all communities (linked by city_id)

Based on the provided CSV data, this will create folders for:

- 7 cities in Utah
- 17 communities across those cities
- Total: ~52 folders (including all website_media folders)

## Customization

To modify the folder structure:

1. Edit `app/api/s3/generate-structure/route.ts`
2. Change the folder naming logic
3. Add/remove subfolder levels
4. Modify the database queries to filter different data
