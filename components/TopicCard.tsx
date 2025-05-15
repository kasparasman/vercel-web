'use client'

import { useState }      from 'react'
import { useSession, signIn } from 'next-auth/react'
import useLikes           from '@/hooks/useLikes'
import TopicModal         from './TopicModal'
import { Heart }          from 'lucide-react'
import type { Topic }     from '@/types/Topic'

export default function TopicCard({ topic }: { topic: Topic }) {
  const [open, setOpen] = useState(false)
  const { data: session, status } = useSession()
  const { count, likedByMe, toggleLike, loading: likesLoading } = useLikes(topic.id)

  const onHeartClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (status === 'loading') return
    if (!session) {
      signIn()
      return
    }
    try {
      await toggleLike()
    } catch (err) {
      console.error('[TopicCard] toggleLike error:', err)
    }
  }

  return (
    <>
      <div
        className="p-4 bg-gray-100 rounded flex justify-between items-center cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div> 
          <h3 className="text-lg font-semibold">{topic.title}</h3>
          <p className="text-sm text-gray-500">
            {new Date(topic.date).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onHeartClick}
          disabled={likesLoading}
          className="flex items-center space-x-1 disabled:opacity-50"
        >
          <Heart
            size={20}
            className={`transition-transform ${
              likedByMe
                ? 'fill-amber-400 text-amber-400 scale-110'
                : 'stroke-gray-600'
            }`}
          />
          <span className="text-sm">{count}</span>
        </button>
      </div>

      {open && (
        <TopicModal
          topic={topic}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
