// lib/authOptions.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';
import { verifyIdToken } from './firebase-admin';
import { query } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const { email, password } = credentials;

        // 1) Verify via Firebase REST API
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
        try {
          const resp = await axios.post(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
            { email, password, returnSecureToken: true }
          );
          const idToken = resp.data.idToken;
          // 2) Decode via Admin SDK
          const { uid } = await verifyIdToken(idToken);
          // 3) Ensure profile exists
          await query(
            `INSERT INTO profiles(id,email,nickname,avatar_url)
             VALUES($1,$2,$3,$4)
             ON CONFLICT (id) DO NOTHING`,
            [uid, email, email, null]
          );
          // 4) Fetch full profile
          const [user] = await query<{
            id: string;
            email: string;
            nickname: string;
            avatar_url: string | null;
          }>(
            'SELECT id, email, nickname, avatar_url FROM profiles WHERE id = $1',
            [uid]
          );
          if (!user) return null;
          return {
            id: user.id,
            name: user.nickname,
            email: user.email,
            image: user.avatar_url || undefined,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name,
        email: session.user?.email,
        image: token.picture,
      };
      return session;
    },
  },
};
