# Preview Environment Authentication Setup

This document explains how to set up Google OAuth authentication to work with Vercel Preview Environments.

## Problem

Google OAuth requires exact specification of Authorized JavaScript Origins without wildcards. This creates issues with Vercel Preview Environments which have dynamic URLs like:
- `https://feedback-git-image-uploads-vercel-se-team.vercel.app`
- `https://feedback-lhw3plnpj-vercel-se-team.vercel.app`

## Solution

We've implemented an OAuth proxy system that:

1. **Detects Preview Environments**: Automatically detects when running in a preview environment
2. **Uses OAuth Proxy**: Routes authentication through a stable production URL
3. **Preserves State**: Maintains the original preview environment URL for post-auth redirects

## Setup Steps

### 1. Google Cloud Console Configuration

In your Google Cloud Console OAuth 2.0 Client:

**Authorized JavaScript Origins:**
```
https://feedback-vercel-se-team.vercel.app
http://localhost:3000  # for development
```

**Authorized Redirect URIs:**
```
https://feedback-vercel-se-team.vercel.app/api/auth/proxy
https://feedback-vercel-se-team.vercel.app/auth/callback
http://localhost:3000/auth/callback  # for development
```

### 2. Environment Variables

Ensure these environment variables are set in all environments (production, preview, development):

```bash
NEXT_PUBLIC_SITE_URL=https://feedback-vercel-se-team.vercel.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. How It Works

#### Production Environment
- Uses Google One Tap (ID tokens) for seamless authentication
- Direct authentication flow without proxy

#### Preview Environment
- Automatically detects preview environment using URL patterns
- Uses traditional OAuth flow with the proxy
- Redirects to production domain for OAuth callback
- Proxy forwards the auth code back to the preview environment

## Implementation Details

### Key Files

1. **`/src/lib/auth-utils.ts`** - Environment detection and OAuth utilities
2. **`/src/app/api/auth/proxy/route.ts`** - OAuth proxy endpoint
3. **`/src/components/auth/GoogleOAuthButton.tsx`** - OAuth button component
4. **`/src/components/auth/AuthGate.tsx`** - Conditional authentication UI

### Authentication Flow for Preview Environments

1. User clicks "Sign in with Google" in preview environment
2. System detects preview environment and uses OAuth flow
3. Redirects to Google OAuth with production domain as redirect URI
4. Google redirects to production proxy with auth code
5. Proxy extracts preview environment URL from state parameter
6. Proxy forwards auth code to preview environment's callback
7. Preview environment processes auth code and creates session

## Testing

To test the preview environment authentication:

1. Create a PR to trigger a preview deployment
2. Visit the preview URL
3. Attempt to sign in with Google
4. Verify successful authentication and redirect back to preview environment

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**: Ensure the production domain is added to Google OAuth settings
2. **State parameter issues**: Check that `NEXT_PUBLIC_SITE_URL` is correctly set
3. **Preview not detected**: Verify the environment detection logic in `isPreviewEnvironment()`

### Debug Steps

1. Check browser network tab for OAuth redirect URLs
2. Verify environment variables in Vercel dashboard
3. Check server logs for proxy errors
4. Ensure Supabase project allows the OAuth provider

## Security Considerations

- The proxy only forwards auth codes, never stores credentials
- State parameters are base64 encoded (not encrypted) - consider encryption for sensitive data
- Preview environments should still validate user permissions after authentication
