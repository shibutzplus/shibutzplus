import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as schema from './schema';

// This script generates migration files based on the current schema

async function generateMigrations() {
  console.log('Generating migration files...');
  
  try {
    // Get database connection string from environment variables
    const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/shibutzplus';
    
    // Create a Neon connection
    const sql = neon(DATABASE_URL);
    
    // Create a Drizzle ORM instance with our schema
    const db = drizzle(sql, { schema });
    
    // Generate migrations
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('Migration files generated successfully!');
  } catch (error) {
    console.error('Migration generation failed:', error);
    throw error;
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  generateMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { generateMigrations };
