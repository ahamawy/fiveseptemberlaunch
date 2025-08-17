import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

/**
 * Server-side Drizzle client using a direct Postgres connection.
 * Note: bypasses RLS. Use ONLY for admin scripts, CLI tools or server jobs.
 * Runtime app code should continue using supabase-js & RLS.
 */
export function createDrizzleDirectClient() {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    throw new Error('SUPABASE_DB_URL missing');
  }
  const pool = new Pool({ connectionString, max: 4 });
  const db = drizzle(pool);
  return { db, pool };
}


