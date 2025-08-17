import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Drizzle + Supabase client
 * Uses RLS-aware supabase-js client under the hood.
 */
export function createDrizzleClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const db = drizzle(supabase);
  return { db, supabase };
}


