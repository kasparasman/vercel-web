// pages/register.tsx
import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

const AVATARS = [
  'https://avatars.dicebear.com/api/adventurer/1.svg',
  'https://avatars.dicebear.com/api/adventurer/2.svg',
  'https://avatars.dicebear.com/api/adventurer/3.svg',
  'https://avatars.dicebear.com/api/adventurer/4.svg',
]

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
        { email, password: pass, returnSecureToken: true }
      )
      router.push('/login')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl mb-4">Register</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Signing up…' : 'Sign Up'}
        </button>
      </form>
    </div>
  )
}
