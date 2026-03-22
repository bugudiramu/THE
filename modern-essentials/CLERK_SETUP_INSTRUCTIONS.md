# Clerk Configuration Fix - Redirect URLs Issue

## Problem
After clicking "Continue with Google" on sign-in, users are redirected to the Clerk dashboard instead of back to your application.

## Solution: Configure Redirect URLs in Clerk Dashboard

### Step 1: Go to Clerk Dashboard
1. Navigate to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application: "modern-essentials" (or similar name)

### Step 2: Configure Redirect URLs
1. Go to **"User & Authentication"** → **"Sessions"**
2. Scroll down to **"Redirect URLs"** section
3. Add the following URLs:

#### Development URLs:
```
http://localhost:3002
http://localhost:3002/sign-in
http://localhost:3002/sign-up
http://localhost:3002/api/auth/clerk/callback
```

#### Production URLs (for later):
```
https://your-domain.com
https://your-domain.com/sign-in
https://your-domain.com/sign-up
https://your-domain.com/api/auth/clerk/callback
```

### Step 3: Configure Webhooks (Optional but Recommended)
1. Go to **"Webhooks"** section
2. Add webhook URL: `http://localhost:4000/webhooks/clerk`
3. Copy the webhook secret and add to your `.env.local`:
```
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Step 4: Configure Google OAuth (If not already done)
1. Go to **"User & Authentication"** → **"Social Connections"
2. Enable Google if not already enabled
3. Make sure Google OAuth credentials are properly set up

### Step 5: Test the Fix
1. Clear your browser cookies for localhost:3002
2. Try signing in again with Google
3. You should now be redirected back to your application

## Why This Happens

Clerk needs to know where to redirect users after authentication. Without proper redirect URLs configured, it defaults to the Clerk dashboard. This is a security feature to prevent unauthorized redirects.

## Current Environment Variables

Your `.env.local` should have:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cmFyZS13b21iYXQtMTguY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_gEMAjWACxHMFMGk5KE0TFlubbTmGMoRTZ6ZZGXldKf
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

## Additional Notes

- The redirect URLs must exactly match your application URLs
- For development, use `http://localhost:3002` (your web app port)
- For production, use your actual domain
- The `/api/auth/clerk/callback` URL is automatically handled by Clerk
- Make sure to save changes in Clerk dashboard after adding URLs

Once you configure these redirect URLs in your Clerk dashboard, the Google sign-in flow will work correctly and redirect users back to your application.
