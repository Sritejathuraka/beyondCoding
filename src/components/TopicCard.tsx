import type { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
  index?: number;
}

const TopicCard = ({ topic, index = 0 }: TopicCardProps) => {
  const gradients = [
    'from-[var(--color-primary)] to-[var(--color-secondary)]',
    'from-[var(--color-secondary)] to-[var(--color-accent)]',
    'from-[var(--color-accent)] to-[var(--color-primary)]',
    'from-purple-500 to-blue-500',
  ];
  
  const gradient = gradients[index % gradients.length];
  
  return (
    <a 
      href={`/topics/${topic.id}`}
      className="card-modern group relative overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      
      <div className="relative p-6">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
          {topic.icon}
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1 group-hover:text-[var(--color-primary)] transition-colors">
          {topic.name}
        </h3>
        <span className="text-sm text-[var(--color-text-muted)]">
          {topic.articleCount} articles
        </span>
      </div>
      
      {/* Arrow indicator */}
      <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
        <svg className="w-4 h-4 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>
    </a>
  );
};

export default TopicCard;
