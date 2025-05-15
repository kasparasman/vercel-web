// lib/authOptions.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authorize } from './auth/credentials'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Email / Password',
      credentials: {
        email:    { label: 'Email',    type: 'text',     placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' }
      },
      authorize
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id      = user.id
        token.name    = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user = {
          id:    token.id as string,
          name:  token.name as string,
          email: session.user.email!,
          image: token.picture as string | undefined,
        }
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
