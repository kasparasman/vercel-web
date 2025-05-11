import { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../../../lib/db";
import { verifyIdToken } from "../../../../lib/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const topicId = parseInt(req.query.id as string, 10);
  
  // Handle GET request to fetch comments
  if (req.method === "GET") {
    try {
      const comments = await query(
        "SELECT id, author_id, content, created_at FROM comments WHERE topic_id = $1 ORDER BY created_at",
        [topicId]
      );
      return res.status(200).json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  
  // Handle POST request to add a comment
  if (req.method === "POST") {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization || "";
      const token = authHeader.replace("Bearer ", "");
      
      // Verify the Firebase token
      const decoded = await verifyIdToken(token);
      
      // Extract the comment content from the request body
      const { content } = req.body;
      
      // Validate comment content
      if (!content || content.trim() === "") {
        return res.status(400).json({ error: "Comment content is required" });
      }
      
      // Insert the comment into the database
      const inserted = await query(
        "INSERT INTO comments(topic_id, author_id, content) VALUES($1, $2, $3) RETURNING *",
        [topicId, decoded.uid, content]
      );
      
      return res.status(201).json(inserted[0]);
    } catch (error) {
      console.error("Error adding comment:", error);
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  
  // Reject other HTTP methods
  return res.status(405).json({ error: "Method not allowed" });
}