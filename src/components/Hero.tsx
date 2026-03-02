import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FeaturedCard from './FeaturedCard';
import { getFeaturedArticle, getPublishedArticles, type StoredArticle } from '../services/articleService';
import { getPublishedCourses } from '../services/courseService';

const Hero = () => {
  const [featuredArticle, setFeaturedArticle] = useState<StoredArticle | null>(null);
  const [articleCount, setArticleCount] = useState(0);
  const [courseCount, setCourseCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [featured, articles, courses] = await Promise.all([
        getFeaturedArticle(),
        getPublishedArticles(),
        getPublishedCourses()
      ]);
      setFeaturedArticle(featured);
      setArticleCount(articles.length);
      setCourseCount(courses.length);
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      {/* Left Content */}
      <div className="animate-fade-in-up">
        <div className="flex items-center gap-3 mb-8">
          <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-full">
            MOBILE
          </span>
          <span className="px-3 py-1 text-xs font-semibold bg-white/10 text-[var(--color-text-muted)] rounded-full border border-[var(--color-border)]">
            AI
          </span>
          <span className="px-3 py-1 text-xs font-semibold bg-white/10 text-[var(--color-text-muted)] rounded-full border border-[var(--color-border)]">
            ENGINEERING
          </span>
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] mb-8">
          <span className="text-[var(--color-text)]">Think </span>
          <span className="gradient-text font-serif italic">beyond</span>
          <br />
          <span className="text-[var(--color-text)]">the code</span>
          <span className="gradient-text">.</span>
        </h1>
        
        <p className="text-[var(--color-text-muted)] text-lg leading-relaxed mb-10 max-w-lg">
          Insights on mobile development, AI engineering, and the craft of building things that matter — by Sriteja.
        </p>
        
        <div className="flex items-center gap-4">
          <Link to="/blogs" className="btn-primary px-8 py-4 text-base inline-flex items-center gap-2 group">
            Start Reading
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link to="/courses" className="btn-outline px-6 py-4 inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Browse Courses
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 mt-12 pt-8 border-t border-[var(--color-border)]">
          <div>
            <p className="text-3xl font-bold gradient-text">{articleCount}</p>
            <p className="text-sm text-[var(--color-text-muted)]">Articles</p>
          </div>
          <div className="w-px h-10 bg-[var(--color-border)]" />
          <div>
            <p className="text-3xl font-bold gradient-text">{courseCount}</p>
            <p className="text-sm text-[var(--color-text-muted)]">Courses</p>
          </div>
        </div>
      </div>
      
      {/* Right Content - Featured Article */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        {loading ? (
          <div className="aspect-[4/3] rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : featuredArticle ? (
          <FeaturedCard article={featuredArticle} />
        ) : (
          <div className="aspect-[4/3] rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center p-8 text-center">
            <div>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <p className="text-[var(--color-text-muted)]">No featured article yet</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
