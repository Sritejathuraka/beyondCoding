import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ArticleCard from './ArticleCard';
import { getPublishedArticles, type StoredArticle } from '../services/articleService';

const LatestArticles = () => {
  const [articles, setArticles] = useState<StoredArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      const data = await getPublishedArticles();
      setArticles(data.slice(0, 6));
      setLoading(false);
    };
    loadArticles();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-20 relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-0 w-32 h-32 bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-40 h-40 bg-[var(--color-secondary)]/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between mb-12 animate-fade-in-up">
        <div>
          <span className="text-[var(--color-primary)] text-sm font-medium uppercase tracking-wider mb-2 block">Blog</span>
          <h2 className="text-4xl font-bold text-[var(--color-text)]">Latest <span className="gradient-text">Articles</span></h2>
        </div>
        <Link 
          to="/blogs" 
          className="btn-outline group flex items-center gap-2"
        >
          View all 
          <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--color-text-muted)]">No articles yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {articles.map((article, index) => (
            <ArticleCard key={article.id} article={article} index={index} />
          ))}
        </div>
      )}
    </section>
  );
};

export default LatestArticles;
