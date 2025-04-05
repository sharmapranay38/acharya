import type { Config } from "drizzle-kit";

export default {
  schema: "./db/migrations/0000_initial_schema.sql",
  out: "./db/migrations",
  driver: "mysql2",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config; 