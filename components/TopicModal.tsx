'use client'

import { useState, FormEvent } from 'react'
import { useSession, signIn }  from 'next-auth/react'
import useComments             from '@/hooks/useComments'
import Link                    from 'next/link'
import type { Topic }          from '@/types/Topic'

export default function TopicModal({
  topic,
  onClose
}: {
  topic: Topic
  onClose: () => void
}) {
  const { data: session, status } = useSession()
  const { comments, loading, addComment } = useComments(topic.id)
  const [text, setText] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // Wait for session to resolve
    if (status === 'loading') return
    // If not signed in, trigger NextAuth sign-in
    if (!session) {
      signIn()
      return
    }
    if (!text.trim()) return

    try {
      await addComment(text.trim())
      setText('')
    } catch (err) {
      console.error('[TopicModal] addComment error:', err)
      alert('Error posting comment: ' + (err as Error).message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 w-full max-w-lg rounded-lg">
        <button onClick={onClose} className="float-right">✕</button>

        {/* Topic header & body */}
        <h2 className="text-2xl font-bold mb-1">{topic.title}</h2>
        <p className="text-sm text-gray-500 mb-4">
          {new Date(topic.date).toLocaleDateString()}
        </p>
        <div className="prose mb-6">{topic.body}</div>
        <hr className="my-4" />

        {/* Comments list */}
        <div className="mt-4 space-y-3 h-48 overflow-y-auto">
          {loading
            ? <p>Loading…</p>
            : comments.map(c => (
                <div key={c.id} className="p-2 bg-gray-50 rounded">
                  <p>{c.content}</p>
                  <small className="text-gray-400">
                    {new Date(c.created_at).toLocaleTimeString()}
                  </small>
                </div>
              ))}
        </div>

        {/* Comment form or prompt */}
        {session ? (
          <form onSubmit={handleSubmit} className="mt-4">
            <textarea
              className="w-full border p-2 rounded"
              rows={2}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Add a comment…"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
            >
              Post Comment
            </button>
          </form>
        ) : (
          <p className="mt-4">
            <button
              onClick={() => signIn()}
              className="text-blue-600 underline"
            >
              Log in
            </button>{' '}
            or{' '}
            <Link href="/register">
              <a className="text-blue-600 underline">register</a>
            </Link>{' '}
            to post comments.
          </p>
        )}
      </div>
    </div>
  )
}
