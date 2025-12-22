import { loadEnv } from './load-env';

// This function will generate a new migration based on the updated schema
export async function generateMigration() {
  // Load environment variables from .env.local
  loadEnv();

  console.log('Generating migration for schema changes...');

  try {
    // Use the drizzle-kit CLI directly
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { exec } = require('child_process');

    exec('npx drizzle-kit generate:pg --schema=./src/db/schema/index.ts --out=./drizzle', (error: Error | null, stdout: string, stderr: string) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.log('Migration generated successfully');
    });
  } catch (error) {
    console.error('Migration generation failed:', error);
    throw error;
  }
}

// Generate migration if this file is executed directly
if (require.main === module) {
  generateMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
