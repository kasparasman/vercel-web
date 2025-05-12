// hooks/useComments.ts
import useSWR from 'swr';
import { useCallback } from 'react';
import { useUser } from '../context/UserContext';

const fetcher = (url: string) => fetch(url).then(res => {
  console.log('[useComments] GET', url, '→', res.status);
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
});

export default function useComments(topicId: number) {
  const { user } = useUser();
  const { data, error, mutate } = useSWR(
    `/api/topics/${topicId}/comments`, fetcher, { refreshInterval: 5000 }
  );

  const addComment = useCallback(async (content: string) => {
    console.log('[useComments] addComment called with', content, 'user=', user);
    if (!user) {
      console.error('[useComments] no user, aborting');
      throw new Error('Not authenticated');
    }
    const token = await user.getIdToken();
    console.log('[useComments] got token', token.slice(0,10) + '…');

    const res = await fetch(`/api/topics/${topicId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    console.log('[useComments] POST status', res.status);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      console.error('[useComments] POST error payload', err);
      throw new Error(err.error || 'Failed to post comment');
    }
    const json = await res.json();
    console.log('[useComments] POST response json', json);
    mutate();
  }, [topicId, user, mutate]);

  return {
    comments: data || [],
    loading: !error && !data,
    error,
    addComment,
  };
}
