import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const encodedOrigin = searchParams.get('origin')
  
  if (!code) {
    return NextResponse.json({ error: 'No authorization code provided' }, { status: 400 })
  }

  try {
    let targetOrigin = 'https://gtmfeedback.vercel.app' // default fallback
    
    // Decode the origin parameter if provided
    if (encodedOrigin) {
      try {
        // Reverse the URL-safe base64 encoding
        const base64Origin = encodedOrigin.replace(/[-_]/g, (match) => {
          return { '-': '+', '_': '/' }[match] || match
        })
        
        targetOrigin = Buffer.from(base64Origin, 'base64').toString()
        console.log('OAuth proxy - decoded origin:', { encodedOrigin, targetOrigin })
      } catch (e) {
        console.warn('Failed to decode origin parameter:', e)
      }
    }

    // Construct the callback URL for the target environment
    const callbackUrl = `${targetOrigin}/auth/callback?code=${encodeURIComponent(code)}`
    
    console.log('OAuth proxy - redirecting to:', callbackUrl)
    
    // Redirect to the target environment's callback handler
    return NextResponse.redirect(callbackUrl)
  } catch (error) {
    console.error('OAuth proxy error:', error)
    return NextResponse.redirect('https://gtmfeedback.vercel.app/auth/auth-code-error')
  }
}
