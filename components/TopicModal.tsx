'use client';

import { useState } from 'react';
import useComments from '../hooks/useComments';
import { useUser } from '../context/UserContext';
import Link from 'next/link';

export default function TopicModal({ topic, onClose }) {
  console.log('Modal got topic.body=', topic.body);  // << add this!
  const { comments, loading, addComment } = useComments(topic.id);
  const { user } = useUser();
  const [text, setText] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 w-full max-w-lg rounded-lg">
        <button onClick={onClose} className="float-right">✕</button>
        {/* ...topic header & body... */}
        <h2 className="text-2xl font-bold mb-1">{topic.title}</h2>
        <p className="text-sm text-gray-500 mb-4">
        {new Date(topic.date).toLocaleDateString()}
        </p>
        <div className="prose mb-6">{topic.body}</div>
        <hr className="my-4" />

        {/* comments list */}
        <div className="mt-4 space-y-3 h-48 overflow-y-auto">
          {loading ? 'Loading…' : comments.map(c => (
            <div key={c.id} className="p-2 bg-gray-50 rounded">
              <p>{c.content}</p>
              <small className="text-gray-400">
                {new Date(c.created_at).toLocaleTimeString()}
              </small>
            </div>
          ))}
        </div>

        {user ? (
          <form
            onSubmit={async e => {
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
            }}
            className="mt-4"
          >
            <textarea
              className="w-full border p-2 rounded"
              rows={2}
              value={text}
              onChange={e => {
                console.log('[Modal] textarea onChange:', e.target.value);
                setText(e.target.value);
              }}
            />
            <button
              type="submit"
              disabled={!text}
              onClick={() => console.log('[Modal] submit button clicked')}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded"
            >
              Post Comment
            </button>
          </form>
        ) : (
          <p className="mt-4">
            <Link href="/login" className="text-blue-600 underline">Log in</Link>
             or 
            <Link href="/register" className="text-blue-600 underline">register</Link>
             to post comments.
          </p>
        )}
      </div>
    </div>
  );
}
