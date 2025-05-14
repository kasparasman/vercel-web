'use client'

import { useState } from 'react';
import { registerClient } from '../lib/firebase-client';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password,  setPass ] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerClient(email, password);
    // 2) Immediately call NextAuth credentials signIn
    const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      })
  
      if (result?.error) {
        alert('Login after register failed: ' + result.error)
      } else {
        // 3) Now you have a session cookie → go home
        router.push('/')
      }
    }

    return (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPass(e.target.value)}
            required
          />
          <button type="submit">Register &amp; Sign In</button>
        </form>
      )
    }
    