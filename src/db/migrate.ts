import { migrate } from 'drizzle-orm/neon-http/migrator';
import { loadEnv } from './load-env';
import { db } from './index';

// This function will run all migrations
export async function runMigrations() {
  // Load environment variables from .env.local
  loadEnv();

  console.log('Running migrations...');

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
