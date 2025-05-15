// lib/auth/credentials.ts
import axios from 'axios'
import { verifyIdToken } from '../firebase-admin'
import { prisma } from '@/lib/prisma'

/**
 * NextAuth will call this under the hood with two args:
 *  - credentials: Record<'email'|'password', string> | undefined
 *  - req:       the internal NextAuth request object (you can ignore it)
 */
export async function authorize(
  credentials: Record<'email' | 'password', string> | undefined,
  req?: unknown
): Promise<
  | { id: string; name: string; email: string; image?: string }
  | null
> {
  if (!credentials) return null

  const { email, password } = credentials

  try {
    // 1) Sign in via Firebase REST API
    const apiKey = process.env.FIREBASE_API_KEY!
    const resp = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      { email, password, returnSecureToken: true }
    )

    // 2) Decode the ID token with Admin SDK
    const { idToken } = resp.data
    const { uid } = await verifyIdToken(idToken)

    // 3) Upsert into profiles table
    const user = await prisma.profiles.upsert({
      where: { id: uid },
      update: {},                             // no changes if it already exists
      create: { id: uid, email, nickname: email, avatar_url: null },
      select: {                              // return only the columns you care about
        id: true,
        email: true,
        nickname: true,
        avatar_url: true,
      },
    });    
    if (!user) return null

    // 5) Return the shape NextAuth expects
    return {
      id:    user.id,
      name:  user.nickname,
      email: user.email,
      image: user.avatar_url || undefined,
    }
  } catch (err: any) {
    console.error('Authorize error:', err)
    return null
  }
}