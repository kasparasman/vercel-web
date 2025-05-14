// pages/api/topics/[id]/comments.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions }      from '../../../../lib/authOptions'
import { query }            from '../../../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const topicId = parseInt(req.query.id as string, 10)
  console.log('👍 [comments] session in API:', session)

  // GET /api/topics/[id]/comments
  if (req.method === 'GET') {
    const comments = await query<{
      id: string
      author_id: string
      content: string
      created_at: string
    }>(
      'SELECT id, author_id, content, created_at FROM comments WHERE topic_id=$1 ORDER BY created_at',
      [topicId]
    )
    return res.status(200).json(comments)
  }

  // POST /api/topics/[id]/comments
  if (req.method === 'POST') {
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    const { content } = req.body
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content required' })
    }

    const inserted = await query<{
      id: string
      topic_id: string
      author_id: string
      content: string
      created_at: string
    }>(
      'INSERT INTO comments(topic_id, author_id, content) VALUES($1,$2,$3) RETURNING *',
      [topicId, session.user.id, content.trim()]
    )
    return res.status(201).json(inserted[0])
  }

  // Method Not Allowed
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
