// lib/db.ts
import { Pool, type QueryResultRow } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Optional timeouts:
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 60000,
});

pool.on('error', err => {
  console.error('Unexpected idle client error', err);
});

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query<T>(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}
