import type { Article } from '../types';

interface FeaturedCardProps {
  article: Article;
}

const FeaturedCard = ({ article }: FeaturedCardProps) => {
  return (
    <div className="bg-[var(--color-card)] rounded-2xl overflow-hidden shadow-sm border border-[var(--color-border)]">
      {/* Featured Image Area */}
      <div className="relative h-48 bg-gradient-to-br from-[#fbe8de] to-[#fcd5c4]">
        <span className="absolute top-4 right-4 text-[var(--color-primary)] text-sm font-medium tracking-wide">
          FEATURED
        </span>
        {/* Decorative circle */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#f8c4b4] rounded-full opacity-60"></div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <span className="inline-block px-3 py-1 bg-[#fbe8de] text-[var(--color-primary)] text-xs font-medium rounded-full mb-4">
          {article.category}
        </span>
        
        <h3 className="text-xl font-bold text-[var(--color-text)] mb-3 leading-tight">
          {article.title}
        </h3>
        
        <p className="text-[var(--color-text-muted)] text-sm leading-relaxed mb-6">
          {article.description}
        </p>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[var(--color-text-muted)] rounded-full flex items-center justify-center text-white text-xs font-medium">
            ST
          </div>
          <div className="flex items-center text-sm text-[var(--color-text-muted)]">
            <span>{article.author}</span>
            <span className="mx-2">·</span>
            <span>{article.date}</span>
            <span className="mx-2">·</span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
