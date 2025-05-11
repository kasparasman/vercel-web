import { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  try {
    // Fetch all topics
    const topics = await query(
      "SELECT id, date, title FROM topics ORDER BY date DESC"
    );
    
    return res.status(200).json(topics);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}