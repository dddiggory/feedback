
import { createBrowserClient } from "@supabase/ssr";
import { getValidatedEnv } from '@/lib/env-validation';

export const createClient = () => {
  const env = getValidatedEnv();
  
  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
};
