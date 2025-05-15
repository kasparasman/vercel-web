'use client'
// pages/index.tsx
import { GetServerSideProps, NextPage } from 'next'
import TopicCard from '../components/TopicCard'
import { prisma } from '@/lib/prisma';
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
    const topics = await prisma.topics.findMany({
        orderBy: { date: 'desc' },
        select: {
          id: true,
          title: true,
          date: true,
          body: true,
        }
      })
      // SAFELY convert all dates to strings
  const safeTopics = topics.map(topic => ({
    id:    topic.id,
    title: topic.title,
    date:  topic.date instanceof Date ? topic.date.toISOString() : topic.date,
    body:  topic.body ?? ''     // ← map null → empty string
  }));

  return { props: { topics: safeTopics } }
}

export default HomePage
