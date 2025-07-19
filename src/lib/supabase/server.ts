import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getEnvVar } from '@/lib/env'

export async function createClient() {
  const cookieStore = await cookies()

  try {
    return createServerClient(
      getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
      getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    )
  } catch (error) {
    console.error('Failed to create server Supabase client:', error);
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
  }
} 