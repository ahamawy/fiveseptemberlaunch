import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/drizzle/schema.ts',
  out: './lib/db/drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.SUPABASE_DB_URL || '',
  },
  verbose: true,
  strict: true,
} satisfies Config;


