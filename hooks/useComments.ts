import useSWR from 'swr'
import { useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface Comment {
  id: number | string
  topic_id?: number
  author_id?: string
  content: string
  created_at: string
}

type UseCommentsResult = {
  comments: Comment[]
  loading: boolean
  error: any
  addComment: (content: string) => Promise<void>
}

export default function useComments(topicId: number): UseCommentsResult {
  const { data: session } = useSession()

  const {
    data,
    error,
    mutate
  } = useSWR<Comment[]>(
    `/api/topics/${topicId}/comments`,
    (url) => fetch(url, { credentials: 'include' }).then(res => res.json()),
    { refreshInterval: 5000 }
  )

  const addComment = useCallback(
    async (content: string) => {
      if (!session?.user?.id) {
        throw new Error('Not authenticated')
      }

      const previous = data ?? []
      const optimistic: Comment = {
        id: `temp-${Date.now()}`,
        topic_id: topicId,
        author_id: session.user.id,
        content,
        created_at: new Date().toISOString()
      }

      // Optimistic UI update
      mutate([...previous, optimistic], false)

      try {
        const res = await fetch(`/api/topics/${topicId}/comments`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to post comment')
        }
        const saved = await res.json()
        // Replace optimistic with real
        mutate([...previous, saved], false)
      } catch (err) {
        console.error('addComment failed, rolling back:', err)
        mutate(previous, false)
        throw err
      }
    },
    [data, session, topicId, mutate]
  )

  return {
    comments: data ?? [],
    loading: !error && !data,
    error,
    addComment
  }
}
