// lib/db.ts
import { Pool } from '@neondatabase/serverless';
import { type QueryResultRow } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
pool.on('error', err => {
  console.error('Neon Pool error:', err);
});

export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const { rows } = await pool.query<T>(text, params);
  return rows
}