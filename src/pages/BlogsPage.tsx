import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import { getPublishedArticles, type StoredArticle } from '../services/articleService';

const BlogsPage = () => {
  const [articles, setArticles] = useState<StoredArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      const allArticles = await getPublishedArticles();
      const published = allArticles.filter(a => a.published);
      setArticles(published);
      setLoading(false);
    };
    loadArticles();
  }, []);

  // Get unique categories
  const categories = ['all', ...new Set(articles.map(a => a.category))];

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(a => a.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Navbar />
        <div className="flex items-center justify-center pt-32">
          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 blur-3xl pointer-events-none" />
          <span className="text-[var(--color-secondary)] text-sm font-medium uppercase tracking-wider mb-4 block relative">Articles</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 relative">
            <span className="text-[var(--color-text)]">Read the </span>
            <span className="gradient-text">Blog</span>
          </h1>
          <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto relative">
            Articles, tutorials, and insights on coding, technology, and software development.
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-glow'
                    : 'glass hover:border-[var(--color-primary)] text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        )}

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
              <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-[var(--color-text-muted)] text-lg">
              {selectedCategory === 'all' 
                ? "No articles published yet. Check back soon!"
                : `No articles in ${selectedCategory} category.`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {filteredArticles.map((article, index) => (
              <Link 
                key={article.id} 
                to={`/article/${article.id}`}
                className="card-modern group overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient header */}
                <div className="h-32 bg-gradient-to-br from-[var(--color-primary)]/20 via-[var(--color-secondary)]/10 to-[var(--color-accent)]/20 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-card)] to-transparent" />
                  <span className="text-5xl opacity-60 relative z-10 group-hover:scale-110 transition-transform duration-300">📝</span>
                </div>
                
                <div className="p-5">
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 text-[var(--color-primary)] mb-3">
                    {article.category}
                  </span>
                  
                  <h2 className="font-semibold text-lg mb-2 line-clamp-2 text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                    {article.title}
                  </h2>
                  
                  {article.description && (
                    <p className="text-[var(--color-text-muted)] text-sm line-clamp-2 mb-3">
                      {article.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {article.readTime}
                    </p>
                    <svg className="w-4 h-4 text-[var(--color-primary)] opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default BlogsPage;
