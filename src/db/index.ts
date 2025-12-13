import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { sql, executeQuery } from "./connectionPool";

// Narrow, stable DB type that doesn't encode $client generics
type DB = NeonHttpDatabase<typeof schema>;

declare global {
  // eslint-disable-next-line no-var
  var __db: DB | undefined;
}

// Create (or reuse in dev) a single Drizzle instance with optimized configuration
export const db: DB =
  global.__db ?? drizzle({
    client: sql,
    schema,
    // *** debug ***
    logger: process.env.NODE_ENV === "development"
    // *** debug ***
  });

// Dev hot-reload friendly caching
if (process.env.NODE_ENV !== "production") {
  global.__db = db;
}

// Re-export schema and utilities
export { schema, executeQuery };
