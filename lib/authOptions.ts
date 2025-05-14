// lib/authOptions.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import axios from 'axios'
import { verifyIdToken } from './firebase-admin'
import { query } from './db'

export const authOptions: NextAuthOptions = {
  // We're using JWT sessions
  session: { strategy: 'jwt' },

  providers: [
    CredentialsProvider({
      name: 'Email / Password',
      credentials: {
        email:    { label: 'Email',    type: 'text',     placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials) return null
        const { email, password } = credentials

        try {
          // 1) Sign in via Firebase REST API
          const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!
          const resp = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
            { email, password, returnSecureToken: true }
          )

          // 2) Decode the ID token with Admin SDK
          const idToken = resp.data.idToken as string
          const decoded = await verifyIdToken(idToken)
          const uid = decoded.uid

          // 3) Upsert into YOUR profiles table (nickname & avatar_url have NOT NULL / NULL constraints)
          await query(
            `INSERT INTO profiles(id, email, nickname, avatar_url)
             VALUES($1, $2, $3, $4)
             ON CONFLICT (id) DO NOTHING`,
            [uid, email, email, null]
          )

          // 4) Fetch the complete profile row
          const [user] = await query<{
            id: string
            email: string
            nickname: string
            avatar_url: string | null
          }>(
            `SELECT id, email, nickname, avatar_url
             FROM profiles
             WHERE id = $1`,
            [uid]
          )

          if (!user) return null

          // 5) Return the shape NextAuth expects: id, name, email, image
          return {
            id:    user.id,
            name:  user.nickname,
            email: user.email,
            image: user.avatar_url || undefined
          }
        } catch (err: any) {
          console.error('Authorize() error:', err)
          return null
        }
      }
    })
  ],

  callbacks: {
    // 1) Persist these fields into the JWT
    async jwt({ token, user }) {
      if (user) {
        token.id      = user.id
        token.name    = user.name
        token.picture = user.image
      }
      return token
    },

    // 2) Make them available on client-side `session.user`
    async session({ session, token }) {
      if (session.user) {
        session.user = {
          id:    token.id as string,
          name:  token.name as string,
          email: session.user.email!,
          image: token.picture as string | undefined
        }
      }
      return session
    }
  },

  // Used to encrypt/sign your JWTs and cookies
  secret: process.env.NEXTAUTH_SECRET
}
