import useSWR from "swr";
import { useCallback } from "react";
import { getUserIdToken } from "../lib/firebase";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Network error");
    return res.json();
  });

export default function useComments(topicId: number) {
  const { data, error, mutate } = useSWR(
    `/api/topics/${topicId}/comments`,
    fetcher,
    { refreshInterval: 5000 } // Poll every 5 seconds
  );

  const addComment = useCallback(
    async (content: string) => {
      try {
        // Get the user's ID token
        const token = await getUserIdToken();
        
        if (!token) {
          throw new Error("You must be logged in to post a comment");
        }
        
        const res = await fetch(
          `/api/topics/${topicId}/comments`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content }),
          }
        );
        
        if (!res.ok) {
          throw new Error("Failed to post comment");
        }
        
        // Re-fetch comments immediately
        mutate();
        return true;
      } catch (error) {
        console.error("Error adding comment:", error);
        return false;
      }
    },
    [topicId, mutate]
  );

  return {
    comments: data || [],
    loading: !error && !data,
    error,
    addComment,
  };
}