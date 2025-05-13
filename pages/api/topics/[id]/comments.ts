// pages/api/topics/[id]/comments.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../../lib/authOptions'
import { query } from '../../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const topicId = parseInt(req.query.id as string, 10)

  if (req.method === 'GET') {
    const comments = await query(
      'SELECT id, author_id, content, created_at FROM comments WHERE topic_id=$1 ORDER BY created_at',
      [topicId]
    )
    return res.status(200).json(comments)
  }

  if (req.method === 'POST') {
    if (!session?.user?.id) return res.status(401).json({ error: 'Not authenticated' })
    const { content } = req.body
    if (!content) return res.status(400).json({ error: 'Content required' })

    const inserted = await query(
      'INSERT INTO comments(topic_id, author_id, content) VALUES($1,$2,$3) RETURNING *',
      [topicId, session.user.id, content]
    )
    return res.status(201).json(inserted[0])
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
