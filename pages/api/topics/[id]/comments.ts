// pages/api/topics/[id]/comments.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../../lib/db';
import { verifyIdToken } from '../../../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const topicId = parseInt(req.query.id as string, 10);

  if (req.method === 'GET') {
    const comments = await query(
      'SELECT id, author_id, content, created_at FROM comments WHERE topic_id = $1 ORDER BY created_at',
      [topicId]
    );
    return res.status(200).json(comments);
  }

  if (req.method === 'POST') {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer '))
        return res.status(401).json({ error: 'Authentication required' });

      // Verify token
      const token = authHeader.split(' ')[1];
      const decoded = await verifyIdToken(token);
      const uid = decoded.uid;
      // Fallback if email is missing
      const email = decoded.email || `${uid}@anon.firebase`;

      // Upsert the profile row
      await query(
        `INSERT INTO profiles(id,email,nickname)
         VALUES($1,$2,$3)
         ON CONFLICT (id) DO NOTHING`,
        [uid, email, email]
      );

      const { content } = req.body;
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Content is required' });
      }

      // Insert the comment
      const inserted = await query(
        'INSERT INTO comments(topic_id, author_id, content) VALUES($1, $2, $3) RETURNING *',
        [topicId, uid, content]
      );

      return res.status(201).json(inserted[0]);
    } catch (err: any) {
      console.error('🔥 Error in POST /api/topics/[id]/comments:', err);
      // Return the real error message (be careful in prod!)
      return res.status(500).json({ error: err.message || String(err) });
    }
  }

  res.status(405).end();
}
