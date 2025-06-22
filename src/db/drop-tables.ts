import { neon } from '@neondatabase/serverless';
import { loadEnv } from './load-env';

async function dropAllTables() {
  try {
    // Load environment variables
    loadEnv();
    
    console.log('Dropping all tables from database...');
    
    // Get database connection string
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Create a Neon connection
    const sql = neon(DATABASE_URL);
    
    // Drop all tables in the public schema
    const dropTablesQuery = `
      DO $$ 
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `;
    
    await sql.query(dropTablesQuery);
    
    console.log('All tables dropped successfully!');
    return true;
  } catch (error) {
    console.error('Failed to drop tables:', error);
    return false;
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  dropAllTables()
    .then((success) => {
      if (success) {
        process.exit(0);
      } else {
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}

export { dropAllTables };
