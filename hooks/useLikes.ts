// hooks/useLikes.ts
import useSWR from 'swr';
import { useCallback } from 'react';
import { useUser } from '../context/UserContext';

type LikeResponse = { count: number; likedByMe: boolean };

export default function useLikes(topicId: number) {
  const { user } = useUser();

  const { data, error, mutate } = useSWR<LikeResponse>(
    `/api/topics/${topicId}/likes`,
    (url) => fetch(url, { credentials: 'include' }).then(res => res.json()),
    { refreshInterval: 0 }
  );

  const toggleLike = useCallback(async () => {
    if (!user) throw new Error('Not authenticated');

    // 1. Capture previous state
    const previous = data ?? { count: 0, likedByMe: false };

    // 2. Compute optimistic state
    const optimistic = {
      count: previous.likedByMe
        ? previous.count - 1
        : previous.count + 1,
      likedByMe: !previous.likedByMe,
    };

    // 3. Optimistically update the cache
    mutate(optimistic, false);

    try {
      // 4. Fire the real request
      const token = await user.getIdToken();
      const res = await fetch(`/api/topics/${topicId}/likes`, {
        method: 'POST',
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Network response was not OK');

      // 5. Sync with server’s truth
      const updated: LikeResponse = await res.json();
      mutate(updated, false);
    } catch (err) {
      console.error('Like toggle failed:', err);
      // Roll back by revalidating from the server
      mutate();
      throw err;
    }
  }, [data, user, topicId, mutate]);

  return {
    count: data?.count ?? 0,
    likedByMe: data?.likedByMe ?? false,
    loading: !error && !data,
    toggleLike,
  };
}
