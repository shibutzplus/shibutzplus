import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env.local file
export function loadEnv() {
  const rootDir = path.resolve(__dirname, '../..');
  const envPath = path.join(rootDir, '.env.local');
  
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment variables from ${envPath}`);
    const result = dotenv.config({ path: envPath });
    
    if (result.error) {
      console.error('Error loading .env.local file:', result.error);
      throw result.error;
    }
    
    return true;
  } else {
    console.warn(`No .env.local file found at ${envPath}`);
    return false;
  }
}

// If this file is run directly, load the environment variables
if (require.main === module) {
  loadEnv();
}
