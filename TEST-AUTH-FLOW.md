# Authentication Flow Test

## Current Issue
OTP links are expiring immediately with error:
```
?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

## Root Cause
The redirect URL `http://localhost:3000/auth/callback` is not configured in Supabase dashboard.

## Fix Steps

### 1. Configure Supabase Redirect URLs
Go to: https://app.supabase.com/project/ksidbebbiljckrxlunxi/auth/url-configuration

Add these URLs to **Redirect URLs**:
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/**` (wildcard pattern)

Set **Site URL** to:
- `http://localhost:3000`

### 2. Test Auth Flow

After configuring URLs, test the flow:

1. Go to http://localhost:3000/login
2. Enter your email: malsicario@malsicario.com
3. Check your email for the magic link
4. Click the link - it should:
   - Go to `/auth/callback?code=...`
   - Exchange code for session
   - Redirect to `/admin`

### 3. Verify Session

Visit http://localhost:3000/api/auth-debug to check:
```json
{
  "authenticated": true,
  "session": {
    "user": {
      "id": "...",
      "email": "malsicario@malsicario.com"
    }
  },
  "profile": {
    "role": "admin"
  }
}
```

### 4. Check Middleware

Visit http://localhost:3000/auth-test to see if auth context works.

## Auth Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User enters email at /login                              │
│    → AuthContext.signIn() calls supabase.auth.signInWithOtp│
│    → emailRedirectTo: /auth/callback?redirectTo=/admin      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Supabase sends magic link email                          │
│    Link: /auth/callback?code=ABC123&redirectTo=/admin       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User clicks link → /auth/callback route handler          │
│    → supabase.auth.exchangeCodeForSession(code)             │
│    → Sets session cookie                                    │
│    → Redirects to /admin                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Middleware checks session for /admin                     │
│    → Fetches user_profiles.role                            │
│    → Allows if role = 'admin' or 'editor'                  │
└─────────────────────────────────────────────────────────────┘
```

## Common Issues

### OTP Expired Error
- **Cause**: Redirect URL not in Supabase allowed list
- **Fix**: Add redirect URL to dashboard (see step 1)

### Session Not Persisting
- **Cause**: Cookie not being set properly
- **Fix**: Check that `createRouteHandlerClient` is using async cookies:
  ```typescript
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  ```

### Middleware Redirects to Login
- **Cause**: Profile not found or role check failing
- **Fix**: Check that user_profiles row exists with correct role
  ```sql
  SELECT * FROM user_profiles WHERE email = 'malsicario@malsicario.com';
  ```

## Next Steps

1. ✅ Fix auth-debug route (DONE - async cookies fixed)
2. ✅ Fix auth callback route (DONE - async cookies fixed)
3. ⏳ Configure Supabase redirect URLs (USER ACTION REQUIRED)
4. ⏳ Test full auth flow
5. ⏳ Verify admin access works
