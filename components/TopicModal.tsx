'use client';

import { useState, FormEvent, MouseEvent, JSXElementConstructor, Key, PromiseLikeOfReactNode, ReactElement, ReactNode, ReactPortal } from 'react';
import useComments from '../hooks/useComments';
import { useUser } from '../context/UserContext';
import Link from 'next/link';
import type { Topic } from '../types/Topic';


export default function TopicModal({
  topic,
  onClose,
}: {
  topic: Topic;
  onClose: () => void;
}) {
  console.log('Modal got topic =', topic);

  const { comments, loading, addComment } = useComments(topic.id);
  const { user } = useUser();
  const [text, setText] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('[Modal] form onSubmit fired, text=', text);
    try {
      await addComment(text);
      console.log('[Modal] addComment succeeded');
      setText('');
    } catch (err) {
      console.error('[Modal] addComment error:', err);
      alert('Error posting comment: ' + (err as Error).message);
    }
  };

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

        {/* comments list */}
        <div className="mt-4 space-y-3 h-48 overflow-y-auto">
          {loading
            ? 'Loading…'
            : comments.map((c: { id: Key | null | undefined; content: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | PromiseLikeOfReactNode | null | undefined; created_at: string | number | Date; }) => (
                <div key={c.id} className="p-2 bg-gray-50 rounded">
                  <p>{c.content}</p>
                  <small className="text-gray-400">
                    {new Date(c.created_at).toLocaleTimeString()}
                  </small>
                </div>
              ))}
        </div>

        {user ? (
          <form onSubmit={handleSubmit} className="mt-4">
            <textarea
              className="w-full border p-2 rounded"
              rows={2}
              value={text}
              onChange={e => setText(e.target.value)}
            />
            <button
              type="submit"
              disabled={!text}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
            >
              Post Comment
            </button>
          </form>
        ) : (
          <p className="mt-4">
            <Link href="/login" className="text-blue-600 underline">
              Log in
            </Link>{' '}
            or{' '}
            <Link href="/register" className="text-blue-600 underline">
              register
            </Link>{' '}
            to post comments.
          </p>
        )}
      </div>
    </div>
  );
}
