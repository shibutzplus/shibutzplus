import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Get database connection string from environment variables
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/shibutzplus';

// Create a Neon connection
const sql = neon(DATABASE_URL);

// Create a Drizzle ORM instance with our schema
export const db = drizzle(sql, { schema });

// Export a function to get the database connection
export function getDb() {
  return db;
}

export { schema };
