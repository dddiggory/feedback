
import { createBrowserClient } from "@supabase/ssr";
import { getEnvVar } from "@/lib/env";

export const createClient = () => {
  try {
    return createBrowserClient(
      getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
      getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    );
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    throw new Error('Supabase configuration is missing. Please check your environment variables.');
  }
};
