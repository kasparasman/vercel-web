// hooks/useComments.ts
import useSWR from 'swr';
import { useCallback } from 'react';
import { useUser } from '../context/UserContext';

export interface Comment {
  id: number | string;
  topic_id?: number;
  author_id?: string;
  content: string;
  created_at: string;
}

type UseCommentsResult = {
  comments: Comment[];
  loading: boolean;
  error: any;
  addComment: (content: string) => Promise<void>;
};

export default function useComments(topicId: number): UseCommentsResult {
  const { user } = useUser();

  const { data, error, mutate } = useSWR<Comment[]>(
    `/api/topics/${topicId}/comments`,
    (url) => fetch(url).then(res => res.json()),
    { refreshInterval: 5000 }
  );

  const addComment = useCallback(
    async (content: string) => {
      if (!user) throw new Error('Not authenticated');

      // 1. Snapshot previous comments
      const previous = data ?? [];

      // 2. Create an optimistic comment
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,           // temporary ID
        topic_id: topicId,
        author_id: user.uid,
        content,
        created_at: new Date().toISOString()
      };

      // 3. Optimistically update the UI
      mutate([...previous, optimisticComment], false);

      try {
        // 4. Send the real request
        const token = await user.getIdToken();
        const res = await fetch(`/api/topics/${topicId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ content })
        });
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          throw new Error(errJson.error || 'Failed to post comment');
        }

        // 5. Replace the optimistic list with the server’s result
        const savedComment = await res.json();
        mutate([...previous, savedComment], false);
      } catch (err) {
        console.error('addComment failed, rolling back:', err);
        // 6. Roll back to the previous state
        mutate(previous, false);
        throw err;
      }
    },
    [data, user, topicId, mutate]
  );

  return {
    comments: data ?? [],
    loading: !error && !data,
    error,
    addComment
  };
}
