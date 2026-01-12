# 🐛 Bug Report & Security Audit

**Generated**: 2026-01-12
**Branch**: `claude/code-review-ga4ol`
**Analyzed Components**: Authentication, Media Library, Article Management, RBAC

---

## 🚨 Critical Security Issues

### 1. **Unauthenticated API Access** - `/api/admin/articles/[id]/route.ts`

**Severity**: 🔴 **CRITICAL**
**Location**: `app/api/admin/articles/[id]/route.ts`

**Issue**: GET, PUT, and DELETE endpoints have **NO authentication checks**.

```typescript
// Currently: No auth validation at all
export async function GET(request: Request, { params }: { params: { id: string } }) {
  // Directly queries database with admin client
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('*')
    .eq('id', params.id)
    .single();
}
```

**Impact**:
- Anyone can read draft/archived articles
- Anyone can modify any article
- Anyone can delete any article
- Bypasses all role-based access control

**Fix Required**:
```typescript
// Add authentication check
const session = await getSupabaseServer().auth.getSession();
if (!session.data.session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Verify admin role
const { data: profile } = await supabase
  .from('user_profiles')
  .select('role')
  .eq('id', session.data.session.user.id)
  .single();

if (profile?.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

### 2. **Open Redirect Vulnerability** - OAuth Callback

**Severity**: 🔴 **CRITICAL**
**Location**: `app/auth/callback/route.ts:94`

**Issue**: No validation on `redirectTo` parameter allows attackers to redirect users to malicious sites.

```typescript
// VULNERABLE CODE
const finalUrl = requestUrl.searchParams.get('redirectTo') || redirectTo;
return NextResponse.redirect(new URL(finalUrl, requestUrl.origin));
```

**Attack Scenario**:
1. Attacker sends: `https://yoursite.com/login?redirectTo=https://evil.com`
2. User logs in successfully
3. User redirected to `evil.com` (phishing site)

**Fix Required**:
```typescript
// Validate redirectTo parameter
function isValidRedirect(url: string): boolean {
  // Only allow relative URLs or whitelisted domains
  if (url.startsWith('/')) return true;

  const allowedDomains = ['yoursite.com', 'www.yoursite.com'];
  try {
    const parsed = new URL(url);
    return allowedDomains.includes(parsed.hostname);
  } catch {
    return false;
  }
}

const redirectParam = requestUrl.searchParams.get('redirectTo') || redirectTo;
const finalUrl = isValidRedirect(redirectParam) ? redirectParam : '/';
```

---

### 3. **No CSRF Protection** - OAuth Flow

**Severity**: 🟠 **HIGH**
**Location**: `app/api/auth/oauth/route.ts`, `app/auth/callback/route.ts`

**Issue**: OAuth flow doesn't use `state` parameter for CSRF protection.

**Impact**:
- Attackers can initiate OAuth flow on victim's behalf
- Session fixation attacks possible
- Cross-site request forgery

**Fix Required**:
```typescript
// In /api/auth/oauth
import { randomBytes } from 'crypto';

const state = randomBytes(32).toString('hex');
// Store in session or encrypted cookie
cookies().set('oauth_state', state, { httpOnly: true, secure: true });

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: fullRedirectUrl,
    state, // Add state parameter
  },
});

// In /auth/callback
const state = requestUrl.searchParams.get('state');
const storedState = cookies().get('oauth_state');

if (state !== storedState) {
  return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
}
```

---

### 4. **Media File Ownership** - Any User Can Delete Any File

**Severity**: 🟠 **HIGH**
**Location**: `supabase/migrations/009_fix_storage_delete_policy.sql:21-25`

**Issue**: Storage DELETE policy allows any authenticated user to delete ANY file.

```sql
-- VULNERABLE POLICY
CREATE POLICY "Authenticated users can delete media files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');
```

**Impact**:
- No file ownership tracking
- Users can sabotage others by deleting their files
- No audit trail of who deleted what

**Fix Required**:
```sql
-- Add user_id tracking to storage.objects metadata
-- Update policy to check ownership
CREATE POLICY "Users can only delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'media'
  AND owner = auth.uid()
);

-- Or if using metadata:
USING (
  bucket_id = 'media'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

**Note**: Also need to update upload logic to store owner metadata.

---

### 5. **Insecure Filename Generation** - Predictable File Names

**Severity**: 🟡 **MEDIUM**
**Location**: `app/admin/articles/new/page.tsx:147`

**Issue**: Uses `Math.random()` for filename generation (not cryptographically secure).

```typescript
// INSECURE
const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
```

**Impact**:
- Filenames are predictable
- Potential for filename collisions
- Attackers could guess filenames

**Fix Required**:
```typescript
import { randomBytes } from 'crypto';

const fileName = `${randomBytes(16).toString('hex')}-${Date.now()}.${fileExt}`;
```

---

## ⚠️ High Priority Bugs

### 6. **Authentication Timeout Too Aggressive**

**Severity**: 🟡 **MEDIUM**
**Location**: `contexts/AuthContext.tsx:39`

**Issue**: 1-second timeout on profile fetch is too aggressive for slower networks.

```typescript
setTimeout(() => reject(new Error('Profile fetch timeout')), 1000)
```

**Impact**:
- Users on slow connections can't log in
- Fails silently without user notification
- Poor UX

**Fix**: Increase to 5-10 seconds and show loading state.

---

### 7. **Debug Routes Exposed in Production**

**Severity**: 🟡 **MEDIUM**
**Locations**:
- `app/api/auth-debug/route.ts`
- `app/auth/debug/route.ts`

**Issue**: Debug endpoints expose sensitive session and user data publicly.

**Impact**:
- Information disclosure
- Security through obscurity violated

**Fix Required**:
```typescript
// Add at top of debug routes
if (process.env.NODE_ENV === 'production') {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

---

### 8. **Debug Logging in Production**

**Severity**: 🟡 **MEDIUM**
**Location**: `components/Header.tsx:30`

**Issue**: Logs full user object to console on every header render.

```typescript
console.log('🔍 Header render - user:', user, 'loading:', loading);
```

**Impact**:
- Exposes user data in browser console
- Performance overhead
- Information leakage

**Fix**: Wrap in development check or remove entirely.

---

## 📋 Functional Bugs

### 9. **No File Type Validation (Client-Side)**

**Severity**: 🟡 **MEDIUM**
**Location**: `app/admin/media/page.tsx:122-161`

**Issue**: No client-side validation of file types before upload.

**Impact**:
- Users can attempt to upload disallowed files
- Wasted bandwidth uploading files that will be rejected
- Poor UX - error only shown after upload attempt

**Fix**: Add client-side MIME type check.

---

### 10. **No File Size Validation (Client-Side)**

**Severity**: 🟡 **MEDIUM**
**Location**: `app/admin/media/page.tsx:122-161`

**Issue**: No check for 50MB file size limit before upload.

**Impact**:
- Users can attempt to upload oversized files
- Wasted time and bandwidth
- Server rejects after full upload completes

**Fix**: Check `file.size` before upload.

---

### 11. **Hardcoded File Listing Limits**

**Severity**: 🔵 **LOW**
**Locations**:
- `app/admin/media/page.tsx:65` - 100 files
- `app/admin/studio/page.tsx:42` - 1000 files

**Issue**: No pagination - files beyond limits are invisible.

**Impact**:
- Users can't see all their files
- Inaccurate file counts
- Poor scalability

**Fix**: Implement proper pagination with page navigation.

---

### 12. **Cache-Busting Creates New URLs**

**Severity**: 🔵 **LOW**
**Location**: `app/admin/media/page.tsx:99`

**Issue**: Adds `?t=${Date.now()}` to every image URL on every render.

```typescript
const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
```

**Impact**:
- External references break when URL changes
- Cache benefits lost
- Unnecessary cache invalidation

**Fix**: Only add cache-bust when file is actually updated.

---

### 13. **Broken Featured Images**

**Severity**: 🔵 **LOW**
**Location**: `app/admin/articles/new/page.tsx:165`

**Issue**: If admin deletes media file, articles show broken featured images.

**Impact**:
- No foreign key relationship
- No validation that file exists
- Orphaned references

**Fix**:
- Add reference tracking in database
- Prevent deletion of in-use media
- Or show placeholder for missing images

---

### 14. **No Image Support in Rich Text Editor**

**Severity**: 🔵 **LOW**
**Location**: `components/RichTextEditor.tsx`

**Issue**: TipTap editor has no image extension.

**Impact**:
- Users can't embed images in article content
- Must link to external images
- Poor content authoring experience

**Fix**: Add TipTap Image extension.

---

### 15. **Inefficient Thumbnail Loading**

**Severity**: 🔵 **LOW**
**Location**: `app/admin/media/page.tsx:368-372`

**Issue**: Loads full-resolution images in thumbnail grid.

**Impact**:
- Slow page load with many images
- Wasted bandwidth
- Poor performance

**Fix**: Generate/use thumbnail versions of images.

---

## 📊 Summary

| Severity | Count | Issues |
|----------|-------|--------|
| 🔴 Critical | 2 | #1 Unauthenticated API, #2 Open Redirect |
| 🟠 High | 3 | #3 No CSRF, #4 File Ownership, #5 Insecure Filenames |
| 🟡 Medium | 4 | #6-9 |
| 🔵 Low | 6 | #10-15 |
| **Total** | **15** | |

---

## 🔧 Testing Coverage

### E2E Tests Created:
- ✅ **Authentication** (`e2e/auth.spec.ts`)
  - OAuth flow
  - Session management
  - Security vulnerabilities
  - Middleware protection
  - API authentication

- ✅ **Media Library** (`e2e/media.spec.ts`)
  - File upload/deletion
  - Search and filtering
  - Access control
  - File validation
  - Performance issues

- ✅ **Article Management** (`e2e/articles.spec.ts`)
  - Create/edit/delete
  - Rich text editor
  - Publishing workflow
  - API endpoints

- ✅ **RBAC** (`e2e/rbac.spec.ts`)
  - Admin permissions
  - Reader restrictions
  - API-level enforcement
  - Session validation

### Test Helpers Created:
- ✅ `e2e/helpers/auth.ts` - Authentication utilities
- ✅ `e2e/helpers/media.ts` - Media file utilities

### Configuration:
- ✅ `playwright.config.ts` - Full Playwright setup
- ✅ Package scripts added for E2E testing

---

## 🚀 Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI (interactive)
pnpm test:e2e:ui

# Run in headed mode (see browser)
pnpm test:e2e:headed

# Debug tests
pnpm test:e2e:debug

# Record new tests
pnpm test:e2e:codegen

# View test reports
pnpm test:e2e:report

# Run unit tests
pnpm test

# Run all validation
pnpm validate
```

---

## 📝 Recommendations

### Immediate Actions (Critical):
1. ✅ **Fix unauthenticated API access** - Add auth to `/api/admin/articles/[id]`
2. ✅ **Validate redirect URLs** - Prevent open redirect attacks
3. ✅ **Add CSRF protection** - Implement OAuth state parameter

### Short-term (High Priority):
4. ✅ **Fix file ownership** - Update storage policies and track owners
5. ✅ **Use secure random** - Replace `Math.random()` with `crypto`
6. ✅ **Remove debug routes** - Disable in production
7. ✅ **Add client-side validation** - Check file size/type before upload

### Medium-term:
8. ✅ **Implement pagination** - Handle >100 files
9. ✅ **Add image editor support** - Enable content embedding
10. ✅ **Optimize thumbnails** - Generate smaller preview images

### Long-term:
11. ✅ **Add audit logging** - Track file uploads/deletions
12. ✅ **Implement file versioning** - Prevent data loss
13. ✅ **Add virus scanning** - Scan uploaded files
14. ✅ **Setup automated security testing** - Run E2E tests in CI/CD

---

## 📞 Questions?

For detailed implementation help on any of these fixes, let me know which issue you'd like to tackle first!
