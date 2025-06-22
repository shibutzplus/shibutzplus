import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Get the DATABASE_URL from environment variables
const connectionString = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/shibutzplus';

export default {
  schema: './src/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // For Neon database, we need to use the standard PostgreSQL connection format
    url: connectionString,
  },
  verbose: true,
  strict: true,
} satisfies Config;
