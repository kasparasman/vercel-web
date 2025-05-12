// pages/api/topics/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') return res.status(405).end();
  const topics = await query(
    'SELECT id, title, date FROM topics ORDER BY date DESC'
  );
  res.status(200).json(topics);
}
