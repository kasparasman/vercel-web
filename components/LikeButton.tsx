'use client'

import React from 'react'
import { useSession, signIn } from 'next-auth/react'
import useLikes from '@/hooks/useLikes'

interface LikeButtonProps {
  topicId: number
}

export default function LikeButton({ topicId }: LikeButtonProps) {
  const { data: session, status } = useSession()
  const { count, likedByMe, loading, toggleLike } = useLikes(topicId)

  const handleClick = async () => {
    if (status === 'loading') return
    if (!session) {
      // Prompt sign-in flow if not authenticated
      signIn()
      return
    }
    try {
      await toggleLike()
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      <span>{likedByMe ? '💖' : '🤍'}</span>
      <span>{count}</span>
    </button>
  )
}
