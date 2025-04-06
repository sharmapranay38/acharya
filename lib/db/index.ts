import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Parse the connection string
const connectionString = process.env.DATABASE_URL || "";

// Create the connection
const connection = mysql.createPool({
  uri: connectionString,
  ssl: {
    rejectUnauthorized: true
  },
  // Use a single connection for serverless environments
  connectionLimit: 1,
});

// Create the database instance
export const db = drizzle(connection, { schema, mode: 'default' });
