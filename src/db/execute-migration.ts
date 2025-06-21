import { neon } from '@neondatabase/serverless';
import { loadEnv } from './load-env';
import * as fs from 'fs';
import * as path from 'path';

async function executeMigration() {
  try {
    // Load environment variables
    loadEnv();
    
    console.log('Executing migration SQL directly...');
    
    // Get database connection string
    const DATABASE_URL = process.env.DATABASE_URL;
    
    if (!DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Create a Neon connection
    const sql = neon(DATABASE_URL);
    
    // Read the migration SQL file
    const migrationPath = path.resolve(__dirname, '../../drizzle/0000_flat_mentor.sql');
    console.log(`Reading migration file: ${migrationPath}`);
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }
    
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements (simple approach)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      try {
        await sql.query(statement);
        console.log(`Statement ${i + 1} executed successfully`);
      } catch (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        throw error;
      }
    }
    
    console.log('Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Migration execution failed:', error);
    return false;
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  executeMigration()
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

export { executeMigration };
