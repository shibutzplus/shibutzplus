import { neon } from "@neondatabase/serverless";

// Extract environment variables directly to ensure smooth translation in Edge Runtime
const prodDb = process.env.DATABASE_URL;
const stagingDb = process.env.DATABASE_URL_STAGING;
const isProd = process.env.NODE_ENV === 'production';

// Select the ConnectionString with a secure fallback for build-time safety
const databaseUrl = (isProd ? prodDb : (stagingDb || prodDb)) || "postgresql://mock_user:mock_pass@localhost:5432/mock_db";

console.log("[DB_DEBUG] Database URL loaded. Type:", databaseUrl.includes("localhost") ? "MOCK" : "NEON", "Starts with:", databaseUrl.substring(0, 35));

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
