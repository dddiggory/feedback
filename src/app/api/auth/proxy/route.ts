import { NextRequest, NextResponse } from 'next/server'

// OAuth proxy for preview environments

export async function GET(request: NextRequest) {
  const requestUrl = request.url
  const { searchParams } = new URL(requestUrl)
  const code = searchParams.get('code')
  const encodedOrigin = searchParams.get('origin')
  
  console.log('OAuth proxy - received request:', { requestUrl, code: code ? 'present' : 'missing', encodedOrigin })
  
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
        console.log('OAuth proxy - decoded origin successfully:', { 
          encodedOrigin, 
          base64Origin, 
          targetOrigin,
          isLocalhost: targetOrigin.includes('localhost')
        })
      } catch (e) {
        console.error('Failed to decode origin parameter:', e, { encodedOrigin })
      }
    } else {
      console.log('OAuth proxy - no origin parameter provided, using fallback:', targetOrigin)
    }

    // Validate the target origin
    if (targetOrigin.includes('localhost') && !targetOrigin.startsWith('http://localhost:')) {
      console.error('Invalid localhost origin detected:', targetOrigin)
      targetOrigin = 'https://gtmfeedback.vercel.app'
    }

    // Construct the callback URL for the target environment
    const callbackUrl = `${targetOrigin}/auth/callback?code=${encodeURIComponent(code)}`
    
    console.log('OAuth proxy - final redirect decision:', { 
      targetOrigin, 
      callbackUrl,
      willRedirectToLocalhost: callbackUrl.includes('localhost')
    })
    
    // Redirect to the target environment's callback handler
    return NextResponse.redirect(callbackUrl)
  } catch (error) {
    console.error('OAuth proxy error:', error)
    return NextResponse.redirect('https://gtmfeedback.vercel.app/auth/auth-code-error')
  }
}
