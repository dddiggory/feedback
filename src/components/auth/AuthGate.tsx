'use client'

import React, { useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import GoogleOneTapComponent from './GoogleOneTap'

interface AuthGateProps {
  children: React.ReactNode
}

interface User {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}

export function AuthGate({ children }: AuthGateProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const oneTapRef = useRef<{ prompt: () => void }>(null)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome to Vercel Feedback
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Auth with a @vercel.com email is required.
            </p>
          </div>
          <div className="mt-8 space-y-6">
            <GoogleOneTapComponent ref={oneTapRef} />
            <div className="text-center">
              <p
                className="text-sm text-gray-500 cursor-pointer underline"
                onClick={() => oneTapRef.current?.prompt()}
              >
                Sign in with your Google account to continue
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 