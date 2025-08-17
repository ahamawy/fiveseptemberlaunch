import fs from 'fs';
import { config as loadEnv } from 'dotenv';
// Prefer .env.local, fallback to .env
if (fs.existsSync('.env.local')) {
  loadEnv({ path: '.env.local' });
} else {
  loadEnv();
}
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/drizzle/schema.ts',
  out: './lib/db/drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.SUPABASE_DB_URL || '' },
  verbose: true,
  strict: true,
} satisfies Config;


