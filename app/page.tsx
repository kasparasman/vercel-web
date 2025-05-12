// app/page.tsx (or pages/index.tsx)
import { query } from '../lib/db';
import TopicCard from '../components/TopicCard';

export default async function Page() {
  const topics = await query(
    'SELECT id, title, date, body FROM topics ORDER BY date DESC'
  );
  
  return (
    <main className="p-4 space-y-4">
      {topics.length === 0 ? (
        <p className="text-gray-500">No topics available.</p>
      ) : (
        topics.map((topic) => (
          // pass the entire topic object (with body)
          <TopicCard key={topic.id} topic={topic} />
        ))
      )}
    </main>
  );
}
