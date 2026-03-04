import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import { getArticleById, deleteArticle, type StoredArticle, formatDate } from '../services/articleService';
import { useAuth } from '../contexts/AuthContext';

const ArticleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, canWrite } = useAuth();
  const [article, setArticle] = useState<StoredArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!article || !id) return;
    if (window.confirm(`Are you sure you want to delete "${article.title}"? This action cannot be undone.`)) {
      setDeleting(true);
      try {
        await deleteArticle(id);
        navigate('/blogs');
      } catch {
        alert('Failed to delete article. Please try again.');
        setDeleting(false);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const loadArticle = async () => {
      console.log('ArticleView: Loading article with id:', id);
      if (id) {
        try {
          const found = await getArticleById(id);
          console.log('ArticleView: Loaded article:', found);
          if (mounted) {
            setArticle(found);
            setLoading(false);
          }
        } catch (error) {
          console.error('ArticleView: Error loading article:', error);
          if (mounted) {
            setLoading(false);
          }
        }
      } else {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadArticle();
    
    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (mounted) {
        console.warn('ArticleView: Loading timeout - forcing completion');
        setLoading(false);
      }
    }, 5000);
    
    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 pt-32 pb-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-[var(--color-text)]">Article not found</h1>
          <p className="text-[var(--color-text-muted)] mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="btn-primary inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20 overflow-hidden animate-fade-in-up">
        {/* Article Header */}
        <header className="mb-10">
          <span className="inline-block px-4 py-1.5 text-xs font-medium rounded-full mb-4 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 text-[var(--color-primary)]">
            {article.category}
          </span>
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-[var(--color-text)]">
            {article.title}
          </h1>
          
          {article.description && (
            <p className="text-xl text-[var(--color-text-muted)] mb-6">
              {article.description}
            </p>
          )}
          
          <div className="flex items-center justify-between gap-4 pb-8 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center text-white font-medium">
                ST
              </div>
              <div>
                <p className="font-medium text-[var(--color-text)]">{article.author}</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {formatDate(article.createdAt)} · {article.readTime}
                </p>
              </div>
            </div>
            
            {/* Admin Controls */}
            {canWrite && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/write/${article.id}`}
                  className="px-4 py-2 text-sm glass rounded-lg hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Link>
                {isAdmin && (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {deleting ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Article Content */}
        <article 
          className="prose prose-lg max-w-none overflow-hidden prose-headings:text-[var(--color-text)] prose-p:text-[var(--color-text-muted)] prose-a:text-[var(--color-primary)] prose-strong:text-[var(--color-text)] prose-code:text-[var(--color-secondary)] prose-pre:bg-[#f8fafc] prose-pre:border prose-pre:border-[var(--color-border)]"
          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <Link
              to="/blogs"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-2 glass px-4 py-2 rounded-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to all articles
            </Link>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--color-text-muted)]">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </footer>
      </main>
      
      <Footer />
    </div>
  );
};

export default ArticleView;
