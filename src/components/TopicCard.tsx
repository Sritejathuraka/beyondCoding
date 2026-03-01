import type { Topic } from '../types';

interface TopicCardProps {
  topic: Topic;
}

const TopicCard = ({ topic }: TopicCardProps) => {
  return (
    <a 
      href={`/topics/${topic.id}`}
      className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-md hover:border-[var(--color-primary)] transition-all group"
    >
      <span className="text-3xl mb-4 block">{topic.icon}</span>
      <h3 className="text-lg font-semibold text-[var(--color-text)] mb-1 group-hover:text-[var(--color-primary)] transition-colors">
        {topic.name}
      </h3>
      <span className="text-sm text-[var(--color-text-muted)]">
        {topic.articleCount} articles
      </span>
    </a>
  );
};

export default TopicCard;
