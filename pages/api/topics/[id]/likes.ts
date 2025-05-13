// pages/api/topics/[id]/likes.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/authOptions'
import { query } from '../../../../lib/db'

type LikeResponse = { count: number; likedByMe: boolean }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const topicId = parseInt(req.query.id as string, 10)

  if (req.method === 'GET') {
    const countRes = await query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM likes WHERE topic_id=$1',
      [topicId]
    )
    const count = parseInt(countRes[0].count, 10)
    const likedByMe = session?.user?.id
      ? (await query(
          'SELECT 1 FROM likes WHERE topic_id=$1 AND user_id=$2',
          [topicId, session.user.id]
        )).length > 0
      : false
    return res.status(200).json({ count, likedByMe } as LikeResponse)
  }

  if (req.method === 'POST') {
    if (!session?.user?.id) return res.status(401).json({ error: 'Not authenticated' })
    const userId = session.user.id
    const exists = await query(
      'SELECT id FROM likes WHERE topic_id=$1 AND user_id=$2',
      [topicId, userId]
    )
    if (exists.length) {
      await query('DELETE FROM likes WHERE topic_id=$1 AND user_id=$2', [topicId, userId])
    } else {
      await query('INSERT INTO likes(topic_id, user_id) VALUES($1, $2)', [topicId, userId])
    }
    const newCountRes = await query<{ count: string }>(
      'SELECT COUNT(*) AS count FROM likes WHERE topic_id=$1',
      [topicId]
    )
    const count = parseInt(newCountRes[0].count, 10)
    const likedByMe = exists.length === 0
    return res.status(200).json({ count, likedByMe } as LikeResponse)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
