// pages/api/topics/[id]/likes.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../../../lib/db';
import { verifyIdToken } from '../../../../lib/firebase-admin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const topicId = parseInt(req.query.id as string, 10);

  // GET: return { count, likedByMe }
  if (req.method === 'GET') {
    const countRes = await query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM likes WHERE topic_id = $1',
      [topicId]
    );
    let likedByMe = false;
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      try {
        const { uid } = await verifyIdToken(auth.split(' ')[1]);
        const me = await query(
          'SELECT 1 FROM likes WHERE topic_id = $1 AND user_id = $2',
          [topicId, uid]
        );
        likedByMe = me.length > 0;
      } catch {
        likedByMe = false;
      }
    }
    return res.status(200).json({
      count: parseInt(countRes[0].count, 10),
      likedByMe,
    });
  }

  // POST: toggle like/unlike (requires auth)
  if (req.method === 'POST') {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer '))
      return res.status(401).json({ error: 'Authentication required' });

    let uid: string;
    try {
      uid = (await verifyIdToken(auth.split(' ')[1])).uid;
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // check existing
    const exists = await query(
      'SELECT id FROM likes WHERE topic_id = $1 AND user_id = $2',
      [topicId, uid]
    );
    if (exists.length) {
      // unlike
      await query(
        'DELETE FROM likes WHERE topic_id = $1 AND user_id = $2',
        [topicId, uid]
      );
    } else {
      // like
      await query(
        'INSERT INTO likes(topic_id, user_id) VALUES($1, $2)',
        [topicId, uid]
      );
    }
    // return updated count + status
    const countRes = await query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM likes WHERE topic_id = $1',
      [topicId]
    );
    return res.status(200).json({
      count: parseInt(countRes[0].count, 10),
      likedByMe: exists.length === 0,
    });
  }

  res.status(405).end();
}
