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
    // Use the production domain as proxy for preview environments
    return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gtmfeedback.vercel.app'}/api/auth/proxy`
  }
  
  // Use the standard callback for production/development
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gtmfeedback.vercel.app'}/auth/callback`
}

/**
 * Creates OAuth state parameter for preview environments
 */
export function createOAuthState(redirectUrl: string = '/'): string | undefined {
  const isPreview = isPreviewEnvironment()
  
  if (isPreview) {
    // Get current origin
    const currentOrigin = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://gtmfeedback.vercel.app'
    
    const state = {
      origin: currentOrigin,
      redirectUrl,
    }
    return Buffer.from(JSON.stringify(state)).toString('base64')
  }
  
  return undefined
}
