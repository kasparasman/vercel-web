import TopicCard from "@/components/TopicCard";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { query } from "@/lib/db";

type Topic = {
  id: number;
  title: string;
  date: string;
};

async function getTopics() {
  const topics = await query(
    "SELECT id, date, title FROM topics ORDER BY date DESC"
  );
  return topics;
}

export default async function Home() {
  const topics = await getTopics();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Trending Topics</h1>
        <Button className="flex items-center gap-2">
          <PlusIcon size={16} />
          <span>New Topic</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </div>
  );
}