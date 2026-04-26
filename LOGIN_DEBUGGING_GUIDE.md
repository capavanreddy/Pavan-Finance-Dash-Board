# Login Redirect Debugging Guide

## Problem
After clicking "Sign In" on the login page, the application does not redirect to the dashboard.

## Solution: Follow These Steps

### Step 1: Open Browser Developer Tools
1. Open http://localhost:3000/login in your browser
2. Press **F12** to open Developer Tools
3. Click the **Console** tab
4. Leave this open while testing

### Step 2: Test Login (Method A - Main Login Page)
1. Enter credentials:
   - Email: `pavanreddy@intellicar.in`
   - Password: `Test@123`
2. Click "Sign In"
3. **Watch the Console for debug messages**
4. Look for messages like:
   - `[v0] Login form submitted with email: pavanreddy@intellicar.in`
   - `[v0] Response received, status: 200`
   - `[v0] Login successful, attempting redirect to /`

### Step 3: Test Login (Method B - Simple Test Page)
This is a simpler alternative to debug without UI complexity:

1. Open http://localhost:3000/test-login
2. Click the "Test Login" button
3. You'll see the API response displayed on screen
4. If successful, you should see:
   ```json
   {
     "status": 200,
     "data": {
       "success": true,
       "token": "eyJhbGc...",
       "user": {
         "id": "cmo7p0gy...",
         "email": "pavanreddy@intellicar.in",
         "name": "Pavan Reddy",
         "role": "ADMIN"
       }
     }
   }
   ```
5. Then it should say "Redirecting to /..."
6. You should be redirected to the dashboard

### Step 4: Troubleshooting

**If you see "Signing in..." but nothing happens:**
- Check browser console for errors
- Check if there's a CORS error
- Check if the API is responding (test via curl)

**If you see the API response but no redirect:**
- The API is working, but the redirect might be blocked
- Try refreshing the page manually after seeing the response
- Check if browser allows redirects

**If you see an error message:**
- Email or password incorrect
- Database connection issue
- User not found

### Step 5: Manual Testing via API

Test the API directly:
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pavanreddy@intellicar.in","password":"Test@123"}'
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {...}
}
```

### Step 6: Manual Login Process

If automatic redirect doesn't work:
1. Get the token from the API response
2. The server sets it in a cookie automatically
3. Try visiting http://localhost:3000 (the dashboard)
4. The middleware should recognize the cookie and let you in

## What Should Happen

**Normal flow:**
1. You enter credentials and click Sign In
2. Button shows "Signing in..."
3. Frontend calls `/api/login`
4. Server validates credentials
5. Server returns token + sets `session-token` cookie
6. Frontend sees `success: true`
7. Frontend redirects to `/` using `router.push()`
8. Fallback: After 1 second, also tries `window.location.href = "/"`
9. Browser reloads page with the new cookie
10. Middleware checks the cookie and allows access
11. Dashboard page loads

## Common Issues

### Issue: Stuck on "Signing in..."
- **Cause**: API not responding or browser console has errors
- **Fix**: Check console for errors, verify API is working

### Issue: API works but no redirect
- **Cause**: Browser redirect might be blocked
- **Fix**: Try manually visiting the dashboard page

### Issue: Wrong credentials error
- **Cause**: Email or password incorrect
- **Fix**: Use exact credentials: `pavanreddy@intellicar.in` / `Test@123`

## Files Involved

- **Login UI**: `/src/app/login/page.tsx`
- **Login API**: `/src/app/api/login/route.ts`
- **Authentication**: `/src/lib/session.ts`
- **Middleware**: `/src/middleware.ts`
- **Dashboard**: `/src/app/page.tsx`
- **Test Page**: `/src/app/test-login/page.tsx`

## Debug Information Available

You can check:
1. **Browser Console**: Messages with `[v0]` prefix
2. **Network Tab**: See the POST request to `/api/login` and response
3. **Application Tab**: Check cookies (look for `session-token`)
4. **Test Page**: `/test-login` shows full API response

## Still Not Working?

If you're still having issues after these steps:
1. Open http://localhost:3000/test-login
2. Click "Test Login"
3. Screenshot the results
4. Share what you see in the console
5. Tell me which step failed (API call? Response parsing? Redirect?)

