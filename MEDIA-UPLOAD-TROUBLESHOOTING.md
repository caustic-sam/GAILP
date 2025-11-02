# Media Upload Troubleshooting Guide

## Issue: Images failing to upload

### Quick Checklist

1. **Is the 'media' bucket created?**
   - Go to: https://app.supabase.com/project/ksidbebbiljckrxlunxi/storage/buckets
   - Look for a bucket named "media"
   - If not, create it:
     - Click "New Bucket"
     - Name: `media`
     - Public: **YES** (check this box)
     - Click "Create"

2. **Are storage policies set up?**
   - Run the SQL file: `/scripts/setup-storage-policies.sql`
   - Go to: https://app.supabase.com/project/ksidbebbiljckrxlunxi/sql/new
   - Copy/paste the contents of `setup-storage-policies.sql`
   - Click "Run"

3. **Is the media table created?**
   - If not already done, run: `/scripts/setup-media-library.sql`
   - This creates the database table for storing media metadata

### Common Error Messages

#### "Bucket not found"
**Solution:** Create the media bucket (see step 1 above)

#### "new row violates row-level security policy"
**Solution:** Run the storage policies SQL (see step 2 above)

#### "relation 'media' does not exist"
**Solution:** Run setup-media-library.sql to create the media table

#### "Network error" or timeout
**Solution:** Check your internet connection and Supabase status

### Step-by-Step Setup

#### 1. Create Storage Bucket
```
1. Open: https://app.supabase.com/project/ksidbebbiljckrxlunxi/storage/buckets
2. Click: "New Bucket" button
3. Enter name: media
4. Check: "Public bucket" checkbox
5. Click: "Create bucket"
```

#### 2. Set Up Storage Policies
```
1. Open: https://app.supabase.com/project/ksidbebbiljckrxlunxi/sql/new
2. Copy contents of: /scripts/setup-storage-policies.sql
3. Paste into SQL editor
4. Click: "Run"
5. Verify: You see success messages
```

#### 3. Verify Database Table Exists
```
1. Open: https://app.supabase.com/project/ksidbebbiljckrxlunxi/editor
2. Look for: "media" table in the left sidebar
3. If not there, run: /scripts/setup-media-library.sql
```

### Testing Upload

1. Go to: http://localhost:3001/admin/media
2. Click: "+ Upload Files" button
3. Select: A small image file (< 1MB)
4. Wait for: Success message

If upload fails, check browser console (F12) for specific error message.

### Verification

After successful upload, verify:

1. **In Supabase Storage:**
   - https://app.supabase.com/project/ksidbebbiljckrxlunxi/storage/buckets/media
   - You should see: uploads/2025/11/[timestamp]_[filename]

2. **In Media Table:**
   - https://app.supabase.com/project/ksidbebbiljckrxlunxi/editor/[table-id]
   - Filter: media table
   - You should see: New row with file metadata

3. **In Media Library:**
   - http://localhost:3001/admin/media
   - You should see: Image in grid view

### Still Having Issues?

Check browser console (F12 → Console tab) and look for error messages. Common issues:

- **CORS errors:** Check Supabase URL in .env.local
- **Auth errors:** Verify SUPABASE_ANON_KEY is correct
- **File size:** Try with a smaller file (< 500KB)
- **File type:** Try with a simple .jpg or .png file

### Environment Variables

Verify these are set in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://ksidbebbiljckrxlunxi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

### Contact Info

If still stuck, include these details:
1. Exact error message from browser console
2. Screenshot of the error
3. Which browser you're using
4. Whether the bucket exists in Supabase
