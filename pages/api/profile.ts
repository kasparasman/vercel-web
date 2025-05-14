import { getServerSession } from 'next-auth/next';
import { authOptions }      from '../../lib/authOptions';
import { query }            from '../../lib/db';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: 'Not authenticated' });

  const uid = session.user.id;
  if (req.method === 'GET') {
    const [profile] = await query('SELECT id, email, nickname, avatar_url FROM profiles WHERE id=$1', [uid]);
    return res.status(200).json(profile);
  }

  if (req.method === 'POST') {
    const { nickname, avatar_url } = req.body;
    const upsert = await query(`
      INSERT INTO profiles(id, email, nickname, avatar_url)
      VALUES($1,$2,$3,$4)
      ON CONFLICT (id) DO UPDATE SET nickname=EXCLUDED.nickname, avatar_url=EXCLUDED.avatar_url
    `, [uid, session.user.email, nickname, avatar_url]);
    return res.status(200).json(upsert[0]);
  }

  res.setHeader('Allow', ['GET','POST']);
  res.status(405).end();
}
