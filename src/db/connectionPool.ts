import { neon } from "@neondatabase/serverless";

// Use staging DB for development, production DB for production
const databaseUrl = process.env.NODE_ENV === 'production' 
  ? process.env.DATABASE_URL! 
  : (process.env.DATABASE_URL_STAGING || process.env.DATABASE_URL)!;

// Create a single neon client with proper configuration
export const sql = neon(databaseUrl, {
  arrayMode: false,
  fullResults: false,
});

// Utility function to execute queries with automatic connection cleanup
export async function executeQuery<T>(
  queryFn: () => Promise<T>
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
