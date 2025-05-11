// test-db.cjs
require('dotenv').config({ path: '.env.local' });
console.log('🔍 Loaded DATABASE_URL:', process.env.DATABASE_URL);

const { Pool } = require('pg');

async function test() {
  console.log('▶️  test() starting…');

  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    console.error('❌  DATABASE_URL is not set. Please check your .env.local.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: connStr, // keep the ?sslmode=require in the URL
    ssl: { rejectUnauthorized: false }, // force TLS but accept Neon’s cert
    connectionTimeoutMillis: 5000, // fail quickly if it can’t connect
  });

  pool.on('error', (err) => {
    console.error('🛑 Unexpected pool error:', err);
  });

  let client;
  try {
    console.log('🔌  acquiring client…');
    client = await pool.connect(); // break out the connect step
    console.log('✅  connected to database');

    console.log('⌛  running query SELECT 1 …');
    const res = await client.query({
      text: 'SELECT 1 AS ok',
      rowMode: 'array', // rowMode just to see raw
      // optional statement timeout:
      // statement_timeout: 5000
    });
    console.log('✅  Query result:', res.rows);
  } catch (err) {
    console.error('⛔️  ERROR in test():', err);
  } finally {
    if (client) {
      client.release();
      console.log('👋  client released');
    }
    await pool.end();
    console.log('🏁  pool ended, exiting');
  }
}

test();
