// pages/api/topics/[id]/comments.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions }      from '../../../../lib/authOptions'
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const topicId = parseInt(req.query.id as string, 10)
  console.log('👍 [comments] session in API:', session)

  // GET /api/topics/[id]/comments
  if (req.method === 'GET') {
  const comments = await prisma.comments.findMany({
    where: { topic_id: Number(topicId) },
    orderBy: { created_at: 'asc' },
    select: {
      id: true,
      author_id: true,
      content: true,
      created_at: true
    }
  });

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

const inserted = await prisma.comments.create({
  data: {
    topic_id: Number(topicId),
    author_id: session.user.id,
    content: content.trim()
  },
});
    return res.status(201).json(inserted)
  }

  // Method Not Allowed
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
