'use client'
// pages/index.tsx
import { GetServerSideProps, NextPage } from 'next'
import TopicCard from '../components/TopicCard'
import { query } from '../lib/db'
import type { Topic } from '../types/Topic'

type Props = { topics: Topic[] }

const HomePage: NextPage<Props> = ({ topics }) => (
  <main className="p-4 space-y-4">
    {topics.length === 0 ? (
      <p className="text-gray-500">No topics available.</p>
    ) : (
      topics.map((topic) => <TopicCard key={topic.id} topic={topic} />)
    )}
  </main>
)

export const getServerSideProps: GetServerSideProps<Props> = async () => {
    const topics = await query<Topic>(`
    SELECT id, title, date, body
    FROM topics
    ORDER BY date DESC
  `)
  // SAFELY convert all dates to strings
  const safeTopics = topics.map(topic => ({
    ...topic,
    date: topic.date instanceof Date ? topic.date.toISOString() : topic.date
  }));
  return { props: { topics: safeTopics } }
}

export default HomePage
