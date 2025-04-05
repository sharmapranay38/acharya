import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  console.log("Connecting to database...");
  console.log("Database URL:", process.env.DATABASE_URL);

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  console.log("Connected to database successfully");

  // Read and execute the SQL file
  const sqlPath = path.join(process.cwd(), "db/migrations/0000_initial_schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  console.log("Executing SQL migration...");
  
  try {
    // Split the SQL file into individual statements
    const statements = sql.split(";").filter(statement => statement.trim());
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log("Executing:", statement.trim().substring(0, 50) + "...");
        await connection.query(statement);
      }
    }
    
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }

  await connection.end();
  console.log("Database connection closed");
}

main().catch((err) => {
  console.error("Migration failed");
  console.error(err);
  process.exit(1);
}); 