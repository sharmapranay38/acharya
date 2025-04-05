const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: 'mysql-1d5a184a-sharmapranay38-f5ed.h.aivencloud.com',
    port: 16167,
    user: 'avnadmin',
    password: 'AVNS_qHb808jxCTAJDLEVxW5',
    database: 'defaultdb',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    const migrationFile = await fs.readFile(path.join(__dirname, 'migrations', '0000_initial.sql'), 'utf8');
    await connection.query(migrationFile);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await connection.end();
  }
}

runMigration();
