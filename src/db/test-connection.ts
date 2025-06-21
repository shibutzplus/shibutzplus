import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';
import { loadEnv } from './load-env';

async function testConnection() {
  try {
    // Load environment variables from .env.local
    loadEnv();
    
    console.log('Testing database connection...');
    
    // Get database connection string from environment variables
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    console.log('Using connection string:', DATABASE_URL.replace(/:[^:@]+@/, ':****@')); // Hide password
    
    // Create a Neon connection
    const sql = neon(DATABASE_URL);
    
    // Create a Drizzle ORM instance
    const db = drizzle(sql, { schema });
    
    // Test the connection with a simple query
    console.log('Executing test query...');
    const result = await sql`SELECT version()`;
    
    console.log('Connection successful!');
    console.log('PostgreSQL version:', result[0].version);
    
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  testConnection()
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

export { testConnection };
