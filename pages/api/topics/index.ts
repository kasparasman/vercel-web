// pages/api/topics/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') return res.status(405).end();
const topics = await prisma.topics.findMany({
  orderBy: { date: 'desc' },
  select: {
    id: true,
    title: true,
    date: true,
  }
})
  res.status(200).json(topics);
}
