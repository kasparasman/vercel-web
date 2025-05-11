import { Pool } from "pg";

// This file should only be imported by server components or API routes
const mockTopics = [
  { id: 1, title: "Getting Started with Next.js", date: new Date().toISOString() },
  { id: 2, title: "Firebase Authentication Best Practices", date: new Date(Date.now() - 86400000).toISOString() },
  { id: 3, title: "PostgreSQL vs MySQL: Which to Choose?", date: new Date(Date.now() - 172800000).toISOString() },
  { id: 4, title: "Building Responsive UIs with Tailwind CSS", date: new Date(Date.now() - 259200000).toISOString() },
  { id: 5, title: "React Hooks Explained", date: new Date(Date.now() - 345600000).toISOString() },
];

const mockComments = [
  { id: 1, topic_id: 1, author_id: "user1", content: "This was really helpful, thanks!", created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, topic_id: 1, author_id: "user2", content: "I'm still having trouble with SSR, any advice?", created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 3, topic_id: 2, author_id: "user3", content: "I implemented these practices and they work great!", created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 4, topic_id: 3, author_id: "user1", content: "I prefer PostgreSQL for relational data.", created_at: new Date(Date.now() - 10800000).toISOString() },
];

// Mock query function that returns data without database connection
export async function query(text: string, params?: any[]) {
  if (text.toLowerCase().includes("select") && text.toLowerCase().includes("topics")) {
    return mockTopics;
  } else if (text.toLowerCase().includes("select") && text.toLowerCase().includes("comments")) {
    const topicId = params ? params[0] : null;
    return topicId 
      ? mockComments.filter(c => c.topic_id === topicId)
      : mockComments;
  } else if (text.toLowerCase().includes("insert") && text.toLowerCase().includes("comments")) {
    const topicId = params ? params[0] : null;
    const authorId = params ? params[1] : "anonymous";
    const content = params ? params[2] : "";
    
    const newComment = {
      id: mockComments.length + 1,
      topic_id: topicId,
      author_id: authorId,
      content: content,
      created_at: new Date().toISOString()
    };
    
    return [newComment];
  }
  
  return [];
}