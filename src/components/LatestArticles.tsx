import { Link } from 'react-router-dom';
import ArticleCard from './ArticleCard';
import { latestArticles } from '../data/mockData';
import { getPublishedArticles } from '../services/articleService';

const LatestArticles = () => {
  // Combine user's published articles with mock data
  const userArticles = getPublishedArticles().map(article => ({
    ...article,
    category: article.category,
  }));
  
  // Show user articles first, then mock articles
  const allArticles = [...userArticles, ...latestArticles].slice(0, 6);

  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-[var(--color-text)]">Latest Articles</h2>
        <Link to="/dashboard" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-2">
          View all <span>→</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allArticles.map((article, index) => (
          <ArticleCard key={article.id} article={article} index={index} />
        ))}
      </div>
    </section>
  );
};

export default LatestArticles;
