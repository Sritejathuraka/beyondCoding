import { Link } from 'react-router-dom';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  index: number;
}

const ArticleCard = ({ article, index }: ArticleCardProps) => {
  const categoryColors: Record<string, string> = {
    'ANDROID': 'bg-red-50 text-red-600',
    'IOS': 'bg-gray-100 text-gray-600',
    'FIREBASE': 'bg-orange-50 text-orange-600',
    'AI ENGINEERING': 'bg-pink-50 text-pink-600',
    'MACHINE LEARNING': 'bg-purple-50 text-purple-600',
    'PERFORMANCE': 'bg-yellow-50 text-yellow-600',
    'ARCHITECTURE': 'bg-blue-50 text-blue-600',
    'CAREER': 'bg-green-50 text-green-600',
  };

  return (
    <div className="bg-[var(--color-card)] rounded-xl p-6 border border-[var(--color-border)] hover:shadow-md transition-shadow">
      {/* Number */}
      <span className="text-[var(--color-border)] text-sm font-medium mb-4 block">
        {String(index + 1).padStart(2, '0')}
      </span>
      
      {/* Category Tag */}
      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-4 ${categoryColors[article.category] || 'bg-gray-100 text-gray-600'}`}>
        {article.category}
      </span>
      
      {/* Title */}
      <h3 className="text-lg font-bold text-[var(--color-text)] mb-3 leading-tight">
        {article.title}
      </h3>
      
      {/* Description */}
      <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6">
        {article.description}
      </p>
      
      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-muted)]">
          {article.date} · {article.readTime}
        </span>
        <Link to={`/article/${article.id}`} className="text-[var(--color-primary)] text-sm font-medium hover:underline flex items-center gap-1">
          Read <span>→</span>
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;
