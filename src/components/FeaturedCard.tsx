import { Link } from 'react-router-dom';
import type { Article } from '../types';

interface FeaturedCardProps {
  article: Article;
}

const FeaturedCard = ({ article }: FeaturedCardProps) => {
  return (
    <Link to={`/article/${article.id}`} className="card-modern group cursor-pointer block">
      {/* Featured Image Area with gradient */}
      <div className="relative h-56 bg-gradient-to-br from-[var(--color-primary)] via-[#8b5cf6] to-[var(--color-secondary)] overflow-hidden">
        <span className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/20">
          ✨ FEATURED
        </span>
        {/* Animated decorative circles */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700 delay-100" />
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>
      
      {/* Content */}
      <div className="p-6">
        <span className="inline-block px-3 py-1 bg-[var(--color-primary)]/20 text-[var(--color-primary-light)] text-xs font-semibold rounded-full mb-4">
          {article.category}
        </span>
        
        <h3 className="text-xl font-bold text-[var(--color-text)] mb-3 leading-tight group-hover:gradient-text transition-all duration-300">
          {article.title}
        </h3>
        
        <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6 line-clamp-2">
          {article.description}
        </p>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/10">
            ST
          </div>
          <div className="flex items-center text-sm text-[var(--color-text-muted)]">
            <span className="font-medium text-[var(--color-text)]">{article.author}</span>
            <span className="mx-2 opacity-30">·</span>
            <span>{article.date}</span>
            <span className="mx-2 opacity-30">·</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeaturedCard;
