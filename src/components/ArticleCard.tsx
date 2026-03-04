import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../types';
import { getLikeCount } from '../services/likeService';

interface ArticleCardProps {
  article: Article;
  index: number;
}

const ArticleCard = ({ article, index }: ArticleCardProps) => {
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    getLikeCount(article.id).then(setLikeCount);
  }, [article.id]);

  const categoryColors: Record<string, string> = {
    'ANDROID': 'from-green-500 to-emerald-600',
    'IOS': 'from-gray-500 to-slate-600',
    'FIREBASE': 'from-orange-500 to-amber-600',
    'AI ENGINEERING': 'from-pink-500 to-rose-600',
    'MACHINE LEARNING': 'from-purple-500 to-violet-600',
    'PERFORMANCE': 'from-yellow-500 to-orange-600',
    'ARCHITECTURE': 'from-blue-500 to-indigo-600',
    'CAREER': 'from-teal-500 to-cyan-600',
  };

  return (
    <Link 
      to={`/article/${article.id}`}
      className="card-modern group p-6 opacity-0 animate-fade-in-up block" 
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'forwards' }}
    >
      {/* Number with gradient */}
      <span className="text-4xl font-bold gradient-text opacity-30 mb-4 block">
        {String(index + 1).padStart(2, '0')}
      </span>
      
      {/* Category Tag */}
      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 text-white bg-gradient-to-r ${categoryColors[article.category] || 'from-gray-500 to-slate-600'}`}>
        {article.category}
      </span>
      
      {/* Title */}
      <h3 className="text-lg font-bold text-[var(--color-text)] mb-3 leading-tight group-hover:text-[var(--color-primary-light)] transition-colors duration-300">
        {article.title}
      </h3>
      
      {/* Description */}
      <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6 line-clamp-2">
        {article.description}
      </p>
      
      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--color-text-muted)]">
            {article.date} · {article.readTime}
          </span>
          {likeCount > 0 && (
            <span className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {likeCount}
            </span>
          )}
        </div>
        <span className="text-[var(--color-primary-light)] text-sm font-medium flex items-center gap-1 group/link">
          Read 
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </span>
      </div>
    </Link>
  );
};

export default ArticleCard;
