import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

// Create the connection
const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

// Create the db
export const db = drizzle(poolConnection, { schema, mode: 'default' });
