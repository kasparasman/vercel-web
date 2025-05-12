// components/TopicCard.tsx
'use client';
import { useState } from 'react';
import useLikes from '../hooks/useLikes';
import { Heart } from 'lucide-react';
import { useUser } from '../context/UserContext';
import TopicModal from './TopicModal';
type Topic = {
  id: number;
  title: string;
  date: string;
  body?: string;
};


export default function TopicCard({ topic }: { topic: Topic }) {
  const [open, setOpen] = useState(false);
  const { count, likedByMe, toggleLike, loading: likesLoading } = useLikes(topic.id);
  const { user } = useUser();

  const onHeartClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!user) {
      alert('Please log in or register to like this topic.');
      return;
    }
    try {
      await toggleLike();
    } catch {
      // already rolled back in hook
    }
  };

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
              likedByMe ? 'fill-amber-400 text-amber-400 scale-110' : 'stroke-gray-600'
            }`}
          />
          <span className="text-sm">{count}</span>
        </button>
      </div>

      {open && <TopicModal topic={topic} onClose={() => setOpen(false)} />}
    </>
  );
}
