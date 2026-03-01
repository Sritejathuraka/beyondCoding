import TopicCard from './TopicCard';
import { topics } from '../data/mockData';

const ExploreTopics = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <h2 className="text-3xl font-bold text-[var(--color-text)] mb-2 lg:mb-0">Explore Topics</h2>
        <p className="text-[var(--color-text-muted)]">
          From native mobile to AI engineering —<br className="hidden lg:block" /> find what you're looking for.
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} />
        ))}
      </div>
    </section>
  );
};

export default ExploreTopics;
