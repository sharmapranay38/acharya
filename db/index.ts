import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Create the connection with improved connection options
const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  // Adding connection configuration options
  connectionLimit: 10, // Default is 10
  connectTimeout: 30000, // Increase timeout to 30 seconds (from default 10s)
  waitForConnections: true,
  queueLimit: 0,
  // Disable ssl-mode warning
  ssl: process.env.NODE_ENV === "production" ? {} : undefined,
  // Enable connection retry logic
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000, // 10 seconds
});

// Create the db
export const db = drizzle(poolConnection, { schema, mode: "default" });

// Add a ping function to test connection
export async function testConnection() {
  try {
    await poolConnection.query("SELECT 1");
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
