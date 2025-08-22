/**
 * Determines if we're running in a Vercel preview environment
 */
export function isPreviewEnvironment(): boolean {
  // Check if we're in a Vercel preview deployment
  return !!(
    process.env.VERCEL_ENV === 'preview' ||
    (typeof window !== 'undefined' && 
     window.location.hostname.includes('vercel.app') &&
     !window.location.hostname.includes('gtmfeedback.vercel.app'))
  )
}

/**
 * Gets the appropriate redirect URI for OAuth based on environment
 */
export function getOAuthRedirectUri(): string {
  const isPreview = isPreviewEnvironment()
  
  if (isPreview) {
    // Always use the production domain as proxy for preview environments
    return 'https://gtmfeedback.vercel.app/api/auth/proxy'
  }
  
  // For production/development, use environment variable or fallback
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (siteUrl && !siteUrl.includes('localhost')) {
    return `${siteUrl}/auth/callback`
  }
  
  // Development fallback
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `${window.location.origin}/auth/callback`
  }
  
  // Production fallback
  return 'https://gtmfeedback.vercel.app/auth/callback'
}

/**
 * Creates OAuth state parameter for preview environments
 */
export function createOAuthState(redirectUrl: string = '/'): string | undefined {
  const isPreview = isPreviewEnvironment()
  
  if (isPreview) {
    // Get current origin - prioritize window.location for client-side accuracy
    let currentOrigin = 'https://gtmfeedback.vercel.app' // fallback
    
    if (typeof window !== 'undefined') {
      currentOrigin = window.location.origin
    } else {
      // Server-side: try to get from environment or headers
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
      if (siteUrl && !siteUrl.includes('localhost')) {
        currentOrigin = siteUrl
      }
    }
    
    console.log('Creating OAuth state for origin:', currentOrigin) // Debug log
    
    const state = {
      origin: currentOrigin,
      redirectUrl,
    }
    return Buffer.from(JSON.stringify(state)).toString('base64')
  }
  
  return undefined
}
