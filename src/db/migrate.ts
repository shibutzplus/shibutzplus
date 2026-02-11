import { migrate } from 'drizzle-orm/neon-http/migrator';
import { loadEnv } from './load-env';

// This function will run all migrations
export async function runMigrations() {
  // Load environment variables from .env.local first
  loadEnv();

  console.log('Running migrations...');

  try {
    // Dynamic import to ensure env vars are loaded before DB connection is initialized
    const { db } = await import('./index');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
