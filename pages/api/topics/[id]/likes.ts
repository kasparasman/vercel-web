// pages/api/topics/[id]/likes.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions }      from '../../../../lib/authOptions'
import { prisma } from '@/lib/prisma';

type LikeResponse = { count: number; likedByMe: boolean }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions)
  const topicId = parseInt(req.query.id as string, 10)
  console.log('👍 [likes] session in API:', session)

  // GET /api/topics/[id]/likes
  if (req.method === 'GET') {
      const count = await prisma.likes.count({
      where: { topic_id: topicId }
    })
    const likedByMe = session?.user?.id
      ? (await prisma.likes.findFirst({
          where: {
            topic_id: topicId,
            user_id: session.user.id
          }
        })) !== null
      : false
    return res.status(200).json({ count, likedByMe } as LikeResponse)
  }

  // POST /api/topics/[id]/likes
  if (req.method === 'POST') {
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Not authenticated' })
    }
    const userId = session.user.id

    // Check existing like
    const existingLike = await prisma.likes.findFirst({
      where: {
        topic_id: topicId,
        user_id: userId
      }
    })

    if (existingLike) {
      // Remove like
      await prisma.likes.delete({
        where: { id: existingLike.id }
      })
    } else {
      // Add like
      await prisma.likes.create({
        data: {
          topic_id: topicId,
          user_id: userId
        }
      })
    }

    // Fetch updated count
    const newCount = await prisma.likes.count({
      where: { topic_id: topicId }
    })
    const likedByMe = existingLike == null

    return res.status(200).json({ count: newCount, likedByMe } as LikeResponse)
  }
  // Method Not Allowed
  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
