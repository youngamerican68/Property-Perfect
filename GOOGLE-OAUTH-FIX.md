# Google OAuth Authentication Fix Guide

## Problem Summary
Google OAuth was not working - users would click "Continue with Google", complete the Google authentication flow, but then get redirected back to the login page instead of being logged in.

## Root Cause Analysis
The issue was a mismatch between the OAuth callback implementation and the project's existing authentication patterns:

1. **Over-engineered callback flow**: Used custom server-side callback routes that didn't integrate with the client-side auth system
2. **Cookie management mismatch**: Middleware expected specific cookie names but callback wasn't setting them correctly
3. **Wrong Supabase pattern**: Tried using `@supabase/ssr` instead of the project's `@supabase/auth-helpers-nextjs`

## The Fix (What Actually Worked)

### Step 1: Simplify OAuth Calls
Remove all custom `redirectTo` options and let Supabase handle the default flow.

**Before (broken):**
```tsx
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
  }
})
```

**After (working):**
```tsx
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

### Step 2: Remove Custom Callback Routes
Delete any custom `/auth/callback/route.ts` files. Supabase handles this automatically.

### Step 3: Supabase Dashboard Configuration
Ensure these settings are correct in your Supabase project dashboard:

**Authentication > Providers > Google:**
- Enable "Sign in with Google" toggle
- Client ID: (from Google Cloud Console)
- Client Secret: (from Google Cloud Console)
- Callback URL: `https://[your-project].supabase.co/auth/v1/callback`

### Step 4: Google Cloud Console Configuration
**APIs & Credentials > OAuth 2.0 Client IDs:**
- Authorized JavaScript origins: `http://localhost:3001` (or your dev port)
- Authorized redirect URIs: `https://[your-project].supabase.co/auth/v1/callback`

### Step 5: Fix Client-Server Auth Mismatch (CRITICAL)
The most common remaining issue is that client-side shows "logged in" but middleware denies access to protected routes. This happens when using mismatched Supabase clients.

**Problem**: Using `@supabase/supabase-js` on client but `@supabase/auth-helpers-nextjs` in middleware creates incompatible session storage (localStorage vs cookies).

**Solution**: Use auth-helpers consistently everywhere.

**Update `lib/supabase-client.ts`:**
```tsx
// Before (causes session mismatch)
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(url, key)

// After (works with middleware)
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
export const supabase = createClientComponentClient()
```

**Update `lib/supabase-server.ts`:**
```tsx
// Add server client for user sessions
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerClient = () => {
  return createServerComponentClient({ cookies })
}
```

**Critical**: After making these changes, users must **log out and log back in** for auth-helpers to establish proper cookies.

## Key Insights

### What Doesn't Work
- ❌ Custom server-side callback routes with `@supabase/ssr`
- ❌ Complex redirect flows with multiple hops
- ❌ Mixing server-side and client-side auth patterns
- ❌ Using `createClient` from `@supabase/supabase-js` in server callbacks

### What Works
- ✅ Default Supabase OAuth flow (no custom redirectTo)
- ✅ Client-side auth state management (like in Navbar.tsx)
- ✅ Letting Supabase handle session cookies automatically
- ✅ Using `@supabase/auth-helpers-nextjs` patterns consistently

## Debug Steps for Future Issues

1. **Check server logs** for 307 redirects and auth_code_error
2. **Verify cookie names** that middleware expects vs what callback sets
3. **Test with simplified OAuth calls** (remove custom options first)
4. **Check Supabase dashboard** provider configuration
5. **Verify Google Cloud Console** redirect URLs match exactly

## Files Modified
- `app/login/page.tsx` - Line 77-79: Simplified OAuth call
- `app/signup/page.tsx` - Line 127-129: Simplified OAuth call
- `lib/supabase-client.ts` - Updated to use `createClientComponentClient`
- `lib/supabase-server.ts` - Added `createServerClient` function
- `middleware.ts` - Updated to use `createMiddlewareClient` from auth-helpers
- Removed: `app/auth/callback/route.ts` (not needed)

## Success Criteria
- User clicks "Continue with Google"
- Completes Google authentication
- Gets redirected to dashboard
- Stays logged in (Navbar shows user info)
- Protected routes work correctly

---

**Remember**: With Supabase, less is more. Use their default flows instead of over-engineering custom solutions.

*Documented: August 30, 2025*