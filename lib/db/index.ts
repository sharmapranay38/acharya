import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2/promise";
import * as schema from "./schema";

// Parse the connection string
const connectionString = process.env.DATABASE_URL || "";

// Create the connection pool
const pool = createPool({
  uri: connectionString,
  ssl: {},  // Simplified SSL config to avoid Node.js built-in modules
  connectionLimit: 1,
});

// Create the database instance
export const db = drizzle(pool, { schema, mode: 'default' });
