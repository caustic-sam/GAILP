# Media Library Setup - Complete Instructions

## What You Need To Do (3 Steps)

### Step 1: Create Media Table in Database
1. Open Supabase SQL Editor: https://app.supabase.com/project/ksidbebbiljckrxlunxi/sql/new
2. Copy ALL contents from this file: `/scripts/setup-media-library.sql`
3. Paste into the SQL editor
4. Click "Run"
5. Wait for success message

### Step 2: Set Up Storage Policies
1. Open Supabase SQL Editor: https://app.supabase.com/project/ksidbebbiljckrxlunxi/sql/new
2. Copy ALL contents from this file: `/scripts/setup-storage-policies.sql`
3. Paste into the SQL editor
4. Click "Run"
5. Wait for success message

### Step 3: Verify Bucket is Public
1. Go to: https://app.supabase.com/project/ksidbebbiljckrxlunxi/storage/buckets
2. Click on the "media" bucket
3. Click the settings icon (gear)
4. Make sure "Public bucket" is **CHECKED** ✓
5. If not, check it and save

## Test Upload

After completing all 3 steps:

1. Go to: http://localhost:3001/admin/media
2. Click "+ Upload Files"
3. Select a small image (< 1MB)
4. You should see: "Successfully uploaded 1 file(s)"
5. Image should appear in the media library

## Troubleshooting

### If upload still fails:

1. **Check browser console** (F12 → Console)
2. Copy the exact error message
3. Most common issues:
   - Media table not created (Step 1)
   - Storage policies not set (Step 2)
   - Bucket not public (Step 3)

### Verify Each Step:

**After Step 1 (Media Table):**
- Go to: https://app.supabase.com/project/ksidbebbiljckrxlunxi/editor
- Look for "media" table in left sidebar
- Should have columns: id, filename, original_filename, file_url, etc.

**After Step 2 (Policies):**
- Go to: https://app.supabase.com/project/ksidbebbiljckrxlunxi/auth/policies
- Look for "media" bucket policies
- Should see 4 policies listed

**After Step 3 (Public Bucket):**
- Go to: https://app.supabase.com/project/ksidbebbiljckrxlunxi/storage/buckets
- Click on "media" bucket
- Check the settings - "Public bucket" should be checked

## What These Scripts Do

### setup-media-library.sql
- Creates the `media` database table
- Adds indexes for fast searching
- Creates helper functions for stats
- Sets up auto-update timestamps
- Grants proper permissions

### setup-storage-policies.sql
- Allows public file uploads to storage
- Allows public file viewing/downloading
- Allows authenticated users to update/delete files
- Enables RLS (Row Level Security)

## After Upload Works

You can then:
1. Add featured images to articles
2. Search/filter media files
3. Edit metadata (title, alt text, caption)
4. Delete unwanted files
5. Use media library picker in article editor

## Next Steps

Once uploads are working:
- Test uploading multiple files at once
- Test media library picker in article editor
- Test grid/list view toggle
- Edit metadata on uploaded files
