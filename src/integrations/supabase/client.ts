import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { createMockSupabaseClient } from './mockClient';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
export const supabase: SupabaseClient<Database> = isSupabaseConfigured
  ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : (createMockSupabaseClient() as unknown as SupabaseClient<Database>);

// Admin/service client helper: reuses the configured client (or mock fallback)
// without embedding hardcoded service-role credentials in browser code.
export const adminSupabase: SupabaseClient<Database> = supabase;