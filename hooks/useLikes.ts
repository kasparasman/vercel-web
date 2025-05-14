import useSWR from 'swr'
import { useCallback } from 'react'
import { useSession } from 'next-auth/react'

type LikeResponse = { count: number; likedByMe: boolean }

export default function useLikes(topicId: number) {
  const { data: session } = useSession()

  const { data, error, mutate } = useSWR<LikeResponse>(
    `/api/topics/${topicId}/likes`,
    (url) => fetch(url, { credentials: 'include' }).then(res => res.json()),
    { refreshInterval: 0 }
  )

  const toggleLike = useCallback(async () => {
    if (!session?.user?.id) {
      throw new Error('Not authenticated')
    }

    const previous = data ?? { count: 0, likedByMe: false }
    const optimistic = {
      count: previous.likedByMe ? previous.count - 1 : previous.count + 1,
      likedByMe: !previous.likedByMe
    }

    // Optimistically update
    mutate(optimistic, false)

    try {
      const res = await fetch(`/api/topics/${topicId}/likes`, {
        method: 'POST',
        credentials: 'include'
      })
      if (!res.ok) {
        throw new Error('Network response was not OK')
      }
      const updated: LikeResponse = await res.json()
      mutate(updated, false)
    } catch (err) {
      console.error('Like toggle failed:', err)
      mutate() // revalidate from server
      throw err
    }
  }, [data, session, topicId, mutate])

  return {
    count: data?.count ?? 0,
    likedByMe: data?.likedByMe ?? false,
    loading: !error && !data,
    toggleLike
  }
}
