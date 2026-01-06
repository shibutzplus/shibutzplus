import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const connectionString = (process.env.NODE_ENV === 'production' 
  ? process.env.DATABASE_URL 
  : (process.env.DATABASE_URL_STAGING || process.env.DATABASE_URL)) || 'postgresql://user:password@localhost:5432/shibutzplus';

export default {
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // For Neon database, we need to use the standard PostgreSQL connection format
    url: connectionString,
  },
  verbose: true,
  strict: true,
} satisfies Config;
