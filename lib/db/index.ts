import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Parse the connection string
const connectionString = process.env.DATABASE_URL || "";

// Create the connection
const client = postgres(connectionString, {
  ssl: true, // Enable SSL for secure connections
  max: 1, // Use a single connection for serverless environments
});

// Create the database instance
export const db = drizzle(client, { schema });
