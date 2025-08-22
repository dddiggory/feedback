import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
  }

  try {
    // Decode the state parameter to get the original redirect URL and target origin
    let redirectUrl = '/'
    let targetOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://feedback-vercel-se-team.vercel.app'
    
    if (state) {
      try {
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString())
        redirectUrl = decodedState.redirectUrl || '/'
        targetOrigin = decodedState.origin || targetOrigin
      } catch (e) {
        console.warn('Failed to decode state parameter:', e)
      }
    }

    // Construct the callback URL for the target environment
    const callbackUrl = `${targetOrigin}/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent(redirectUrl)}`
    
    // Redirect to the target environment's callback handler
    return NextResponse.redirect(callbackUrl)
  } catch (error) {
    console.error('OAuth proxy error:', error)
    const targetOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://feedback-vercel-se-team.vercel.app'
    return NextResponse.redirect(`${targetOrigin}/auth/auth-code-error`)
  }
}
