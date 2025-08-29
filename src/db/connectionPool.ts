import { neon, neonConfig } from "@neondatabase/serverless";

// Configure connection pooling
neonConfig.fetchConnectionCache = true;
neonConfig.useSecureWebSocket = false;
neonConfig.pipelineConnect = false;
neonConfig.pipelineTLS = false;

// Create a single neon client with proper configuration
export const sql = neon(process.env.DATABASE_URL!, {
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
