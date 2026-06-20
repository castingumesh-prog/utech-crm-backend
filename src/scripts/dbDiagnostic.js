require('dotenv').config();

const mysql = require('mysql2/promise');

async function runDiagnostic() {
  const host = process.env.DB_HOST || 'NOT_SET';
  const port = process.env.DB_PORT || '3306';
  const database = process.env.DB_NAME || 'NOT_SET';
  const user = process.env.DB_USER || 'NOT_SET';

  console.log('\n=== U TECH CRM DB DIAGNOSTIC ===\n');
  console.log('HOST      :', host);
  console.log('PORT      :', port);
  console.log('DATABASE  :', database);
  console.log('USER      :', user);
  console.log('\nAttempting connection...\n');

  try {
    const connection = await mysql.createConnection({
      host,
      user,
      password: process.env.DB_PASSWORD || '',
      database,
      port: Number(port),
    });

    console.log('✅ Connection Established');

    const [ping] = await connection.query('SELECT 1 AS status');
    console.log('✅ SELECT 1 Result:', ping[0]);

    const [version] = await connection.query('SELECT VERSION() AS version');
    console.log('✅ MySQL Version:', version[0].version);

    const [db] = await connection.query('SELECT DATABASE() AS db');
    console.log('✅ Connected Database:', db[0].db);

    await connection.end();

    console.log('\n🎉 DATABASE READY FOR CRUD TESTING\n');
  } catch (err) {
    console.log('\n❌ DATABASE CONNECTION FAILED\n');
    console.log('Error Code:', err.code || 'UNKNOWN');
    console.log('Message:', err.message || 'No message provided');
    process.exit(1);
  }
}

runDiagnostic();
