import { useState, useEffect } from 'react';
import TopicCard from './TopicCard';
import { getPublishedArticles } from '../services/articleService';
import type { Topic } from '../types';

// Static topic definitions
const topicDefinitions = [
  { id: '1', name: 'Android', icon: '📱' },
  { id: '2', name: 'iOS', icon: '🍎' },
  { id: '3', name: 'AI Engineering', icon: '🤖' },
  { id: '4', name: 'Firebase', icon: '🔥' },
  { id: '5', name: 'Machine Learning', icon: '🧠' },
  { id: '6', name: 'Performance', icon: '⚡' },
  { id: '7', name: 'Architecture', icon: '🏗️' },
  { id: '8', name: 'Career', icon: '🎓' },
];

const ExploreTopics = () => {
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    const loadArticleCounts = async () => {
      const articles = await getPublishedArticles();
      
      // Count articles per category
      const categoryCounts: Record<string, number> = {};
      articles.forEach(article => {
        const category = article.category.toUpperCase();
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      // Map to topics with real counts
      const topicsWithCounts = topicDefinitions.map(topic => ({
        ...topic,
        articleCount: categoryCounts[topic.name.toUpperCase()] || 0
      }));
      
      setTopics(topicsWithCounts);
    };
    loadArticleCounts();
  }, []);
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--color-primary)]/5 to-transparent pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-12 animate-fade-in-up relative">
        <div>
          <span className="text-[var(--color-secondary)] text-sm font-medium uppercase tracking-wider mb-2 block">Categories</span>
          <h2 className="text-4xl font-bold text-[var(--color-text)]">Explore <span className="gradient-text">Topics</span></h2>
        </div>
        <p className="text-[var(--color-text-muted)] mt-4 lg:mt-0 lg:text-right max-w-xs">
          From native mobile to AI engineering — find what you're looking for.
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 stagger-children relative">
        {topics
          .filter(topic => topic.articleCount >= 1)
          .map((topic, index) => (
            <TopicCard key={topic.id} topic={topic} index={index} />
          ))}
      </div>
    </section>
  );
};

export default ExploreTopics;
