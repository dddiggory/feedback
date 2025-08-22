'use client'

import React, { useImperativeHandle, forwardRef, useEffect, useRef } from 'react'
import Script from 'next/script'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { isPreviewEnvironment, getOAuthRedirectUri, createOAuthState } from '@/lib/auth-utils'

interface GoogleOneTapConfig {
  client_id: string
  callback: (response: CredentialResponse) => void
  nonce: string
  use_fedcm_for_prompt?: boolean
}

interface PromptNotification {
  isNotDisplayed: () => boolean
  isSkippedMoment: () => boolean
  isDismissedMoment: () => boolean
  getMomentType: () => string
}

interface TokenResponse {
  access_token: string
  token_type?: string
  expires_in?: number
  scope?: string
}

interface TokenClient {
  requestAccessToken: () => void
}

interface GoogleButtonConfig {
  theme: 'outline' | 'filled_blue' | 'filled_black'
  size: 'large' | 'medium' | 'small'
  type: 'standard' | 'icon'
  text: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  width?: number
}

// Type declarations for Google One Tap
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void
          prompt: (callback?: (notification: PromptNotification) => void) => void
          cancel: () => void
          renderButton: (element: HTMLElement, config: GoogleButtonConfig) => void
        }
        oauth2: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: TokenResponse) => void
          }) => TokenClient
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
  const initializedRef = useRef(false)
  const mountedRef = useRef(true)
  const fallbackButtonRef = useRef<HTMLDivElement>(null)

  const generateNonce = async (): Promise<string[]> => {
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
    const encoder = new TextEncoder()
    const encodedNonce = encoder.encode(nonce)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return [nonce, hashedNonce]
  }

  const handleGoogleSignIn = async (credential: string, nonce: string) => {
    if (!mountedRef.current) return
    
    try {
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential,
        nonce,
      })
      if (error) throw error
      if (mountedRef.current) {
        router.push('/')
      }
    } catch (error) {
      console.error('Error logging in with Google', error)
    }
  }

  const initializeFallbackButton = async () => {
    if (!fallbackButtonRef.current || !window.google?.accounts?.id) return
    
    // Clear any existing content
    fallbackButtonRef.current.innerHTML = ''
    
    window.google.accounts.id.renderButton(fallbackButtonRef.current, {
      theme: 'filled_blue',
      size: 'large',
      type: 'standard',
      text: 'signin_with',
      width: 300,
    })

    // Set up click handler for the rendered button
    const button = fallbackButtonRef.current.querySelector('div[role="button"]')
    if (button) {
      button.addEventListener('click', async () => {
        try {
          // Use OAuth2 popup as fallback
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
            scope: 'openid email profile',
            callback: async (response: TokenResponse) => {
              if (response.access_token) {
                // Convert access token to ID token via Supabase
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                  }
                })
                if (error) throw error
              }
            },
          })
          client.requestAccessToken()
        } catch (error) {
          console.error('Fallback auth error:', error)
        }
      })
    }
  }

  useImperativeHandle(ref, () => ({
    prompt: () => {
      if (window.google?.accounts?.id && initializedRef.current) {
        window.google.accounts.id.prompt((notification: PromptNotification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('FedCM not available, showing fallback button')
            initializeFallbackButton()
          }
        });
      }
    }
  }), [])

  useEffect(() => {
    mountedRef.current = true
    let cancelled = false

    const initializeGoogleOneTap = async () => {
      // Don't initialize if already done or component unmounted
      if (initializedRef.current || !mountedRef.current) return

      // Check session first to avoid unnecessary initialization
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session', error)
        return
      }
      if (data.session) {
        router.push('/')
        return
      }

      // Don't proceed if component was unmounted during session check
      if (!mountedRef.current || cancelled) return

      if (!window.google?.accounts?.id) return

      try {
        const [nonce, hashedNonce] = await generateNonce()
        
        // Double-check we're still mounted after async operation
        if (!mountedRef.current || cancelled) return

        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
          callback: async (response: CredentialResponse) => {
            await handleGoogleSignIn(response.credential, nonce)
          },
          nonce: hashedNonce,
          // Disable FedCM to avoid the NetworkError
          use_fedcm_for_prompt: false,
        })

        initializedRef.current = true
        
        // Try to prompt, but handle failure gracefully
        if (mountedRef.current && !cancelled) {
          window.google.accounts.id.prompt((notification: PromptNotification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              console.log('One Tap not available, showing fallback button')
              initializeFallbackButton()
            }
          })
        }
      } catch (error) {
        console.error('Error initializing Google One Tap', error)
        // Show fallback button on any error
        initializeFallbackButton()
      }
    }

    // Wait for the Google script to be loaded
    if (window.google?.accounts?.id) {
      initializeGoogleOneTap()
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval)
          if (!cancelled && mountedRef.current) {
            initializeGoogleOneTap()
          }
        }
      }, 100)
      
      return () => {
        cancelled = true
        clearInterval(interval)
      }
    }

    return () => {
      cancelled = true
    }
  }, []) // Remove dependencies to prevent re-initialization

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
      // Cancel any pending Google One Tap prompts
      if (window.google?.accounts?.id?.cancel) {
        try {
          window.google.accounts.id.cancel()
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }, [])

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
      <div id="oneTap" className="fixed top-0 right-0 z-[100]" />
      {/* Fallback button when One Tap fails */}
      <div ref={fallbackButtonRef} className="flex justify-center mt-4" />
    </>
  )
})

GoogleOneTapComponent.displayName = 'GoogleOneTapComponent';
export default GoogleOneTapComponent 