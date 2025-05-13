// pages/api/profile.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyIdToken } from '../../lib/firebase-admin'
import { query } from '../../lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const auth = req.headers.authorization || ''
  if (!auth.startsWith('Bearer '))
    return res.status(401).json({ error: 'Auth required' })

  let uid: string, email: string
  try {
    const decoded = await verifyIdToken(auth.split(' ')[1])
    uid = decoded.uid
    email = decoded.email!
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  if (req.method === 'GET') {
    const rows = await query(
      'SELECT id, email, nickname, avatar_url FROM profiles WHERE id = $1',
      [uid]
    )
    return res.status(200).json(rows[0] || null)
  }

  if (req.method === 'POST') {
    const { nickname, avatar_url } = req.body
    if (typeof nickname !== 'string' || !nickname.trim())
      return res.status(400).json({ error: 'Nickname required' })

    await query(
      `INSERT INTO profiles(id,email,nickname,avatar_url)
       VALUES($1,$2,$3,$4)
       ON CONFLICT (id) DO UPDATE
         SET nickname=EXCLUDED.nickname,
             avatar_url=EXCLUDED.avatar_url`,
      [uid, email, nickname, avatar_url]
    )
    const [profile] = await query(
      'SELECT id, email, nickname, avatar_url FROM profiles WHERE id = $1',
      [uid]
    )
    return res.status(200).json(profile)
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}
