/**
 * Determines if we're running in a Vercel preview environment
 */
export function isPreviewEnvironment(): boolean {
  // Check if we're in a Vercel preview deployment
  return !!(
    process.env.VERCEL_ENV === 'preview' ||
    (typeof window !== 'undefined' && 
     window.location.hostname.includes('vercel.app') &&
     !window.location.hostname.includes('feedback-vercel-se-team.vercel.app'))
  )
}

/**
 * Gets the appropriate redirect URI for OAuth based on environment
 */
export function getOAuthRedirectUri(): string {
  const isPreview = isPreviewEnvironment()
  
  if (isPreview) {
    // Use the production domain as proxy for preview environments
    return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://feedback-vercel-se-team.vercel.app'}/api/auth/proxy`
  }
  
  // Use the standard callback for production/development
  return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://feedback-vercel-se-team.vercel.app'}/auth/callback`
}

/**
 * Gets the current origin URL
 */
export function getCurrentOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // Server-side fallback
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://feedback-vercel-se-team.vercel.app'
}

/**
 * Creates OAuth state parameter for preview environments
 */
export function createOAuthState(redirectUrl: string = '/'): string | undefined {
  const isPreview = isPreviewEnvironment()
  
  if (isPreview) {
    const state = {
      origin: getCurrentOrigin(),
      redirectUrl,
    }
    return Buffer.from(JSON.stringify(state)).toString('base64')
  }
  
  return undefined
}
