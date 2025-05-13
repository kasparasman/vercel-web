// pages/profile.tsx
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

const AVATARS = [
  'https://avatars.dicebear.com/api/adventurer/1.svg',
  'https://avatars.dicebear.com/api/adventurer/2.svg',
  // …more avatars
]

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [error, setError] = useState<string | null>(null)

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login')
  }, [status])

  if (status !== 'authenticated') return <p>Loading…</p>

  const handleSave = async () => {
    setError(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, avatar_url: avatar }),
      })
      if (!res.ok) throw new Error((await res.json()).error || 'Save failed')
      alert('Profile saved!')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl">Your Profile</h1>
      {error && <p className="text-red-500">{error}</p>}
      <input
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder="Nickname"
        className="w-full p-2 border rounded"
      />
      <div className="grid grid-cols-4 gap-2">
        {AVATARS.map((url) => (
          <img
            key={url}
            src={url}
            alt=""
            className={`h-12 w-12 rounded-full cursor-pointer border-2 ${
              avatar === url ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() => setAvatar(url)}
          />
        ))}
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-blue-600 text-white p-2 rounded"
      >
        Save Profile
      </button>
    </div>
  )
}
