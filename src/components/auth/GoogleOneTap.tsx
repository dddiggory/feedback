'use client'

import React, { useImperativeHandle, forwardRef, useEffect } from 'react'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface GoogleOneTapConfig {
  client_id: string
  callback: (response: CredentialResponse) => void
  nonce: string
  use_fedcm_for_prompt: boolean
}

// Type declarations for Google One Tap
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void
          prompt: () => void
        }
      }
    }
  }
}

interface CredentialResponse {
  credential: string
}

const GoogleOneTapComponent = forwardRef((_props, ref) => {
  const supabase = createClient()
  const router = useRouter()

  const generateNonce = async (): Promise<string[]> => {
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
    const encoder = new TextEncoder()
    const encodedNonce = encoder.encode(nonce)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return [nonce, hashedNonce]
  }

  useImperativeHandle(ref, () => ({
    prompt: () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt();
      }
    }
  }), [])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const [nonce, hashedNonce] = await generateNonce()
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session', error)
      }
      if (data.session) {
        router.push('/')
        return
      }
      if (!window.google?.accounts?.id) return

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: async (response: CredentialResponse) => {
          try {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: response.credential,
              nonce,
            })
            if (error) throw error
            router.push('/')
          } catch (error) {
            console.error('Error logging in with Google One Tap', error)
          }
        },
        nonce: hashedNonce,
        use_fedcm_for_prompt: true,
      })
      window.google.accounts.id.prompt()
    }

    // Wait for the Google script to be loaded
    if (window.google?.accounts?.id) {
      run()
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval)
          if (!cancelled) run()
        }
      }, 100)
      return () => {
        cancelled = true
        clearInterval(interval)
      }
    }
  }, [router, supabase.auth])

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <div id="oneTap" className="fixed top-0 right-0 z-100" />
    </>
  )
})

GoogleOneTapComponent.displayName = 'GoogleOneTapComponent';
export default GoogleOneTapComponent 