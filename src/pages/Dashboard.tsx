import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import { 
  getMyArticles, 
  deleteArticle, 
  type StoredArticle,
  formatDate 
} from '../services/articleService';
import { getCourses, deleteCourse, type Course } from '../services/courseService';
import { useToast } from '../contexts/ToastContext';

const Dashboard = () => {
  const [articles, setArticles] = useState<StoredArticle[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [articlesData, coursesData] = await Promise.all([
      getMyArticles(),
      getCourses()
    ]);
    setArticles(articlesData);
    setCourses(coursesData);
    setLoading(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteArticle(id);
        toast.success('Article deleted');
        loadData();
      } catch (error) {
        toast.error('Failed to delete article: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the course "${title}"?`)) {
      try {
        await deleteCourse(id);
        toast.success('Course deleted');
        loadData();
      } catch (error) {
        toast.error('Failed to delete course: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  const filteredArticles = articles.filter(article => {
    if (filter === 'published') return article.published;
    if (filter === 'drafts') return !article.published;
    return true;
  });

  const publishedCount = articles.filter(a => a.published).length;
  const draftsCount = articles.filter(a => !a.published).length;

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-fade-in-up">
          <div>
            <span className="text-[var(--color-primary)] text-sm font-medium uppercase tracking-wider mb-2 block">Admin Panel</span>
            <h1 className="text-4xl font-bold text-[var(--color-text)]">Your <span className="gradient-text">Articles</span></h1>
            <p className="text-[var(--color-text-muted)] mt-2">
              Manage your drafts and published articles
            </p>
          </div>
          <Link
            to="/write"
            className="btn-primary inline-flex items-center gap-2 group"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Write New Article
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="card-modern p-6">
            <p className="text-3xl font-bold gradient-text">{articles.length}</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Total Articles</p>
          </div>
          <div className="card-modern p-6">
            <p className="text-3xl font-bold text-[var(--color-accent)]">{publishedCount}</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Published</p>
          </div>
          <div className="card-modern p-6">
            <p className="text-3xl font-bold text-[var(--color-secondary)]">{draftsCount}</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Drafts</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <button
            onClick={() => setFilter('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              filter === 'all' 
                ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-glow' 
                : 'glass hover:border-[var(--color-primary)] text-[var(--color-text-muted)]'
            }`}
          >
            All ({articles.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              filter === 'published' 
                ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-glow' 
                : 'glass hover:border-[var(--color-primary)] text-[var(--color-text-muted)]'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setFilter('drafts')}
            className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              filter === 'drafts' 
                ? 'bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-glow' 
                : 'glass hover:border-[var(--color-primary)] text-[var(--color-text-muted)]'
            }`}
          >
            Drafts ({draftsCount})
          </button>
        </div>

        {/* Articles List */}
        {filteredArticles.length === 0 ? (
          <div className="card-modern p-12 text-center animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <p className="text-[var(--color-text-muted)] mb-4">
              {filter === 'all' 
                ? "You haven't written any articles yet." 
                : filter === 'published'
                  ? "No published articles yet."
                  : "No drafts saved."}
            </p>
            <Link
              to="/write"
              className="inline-flex items-center gap-2 text-[var(--color-primary)] font-medium hover:text-[var(--color-secondary)] transition-colors"
            >
              Write your first article
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {filteredArticles.map((article, index) => (
              <div
                key={article.id}
                className="card-modern p-6 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        article.published 
                          ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' 
                          : 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)]'
                      }`}>
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)] px-2 py-1 rounded-full bg-[var(--color-surface)]">
                        {article.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-1 text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                      {article.title || 'Untitled'}
                    </h3>
                    
                    {article.description && (
                      <p className="text-[var(--color-text-muted)] text-sm mb-2 line-clamp-2">
                        {article.description}
                      </p>
                    )}
                    
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Last updated {formatDate(article.updatedAt)} · {article.readTime}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {article.published && (
                      <Link
                        to={`/article/${article.id}`}
                        className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] glass rounded-lg transition-all"
                      >
                        View
                      </Link>
                    )}
                    <Link
                      to={`/write/${article.id}`}
                      className="px-4 py-2 text-sm glass rounded-lg hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id, article.title)}
                      className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Courses Section */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8 animate-fade-in-up">
            <div>
              <span className="text-[var(--color-secondary)] text-sm font-medium uppercase tracking-wider mb-2 block">Learning Paths</span>
              <h2 className="text-3xl font-bold text-[var(--color-text)]">Your <span className="gradient-text">Courses</span></h2>
              <p className="text-[var(--color-text-muted)] mt-1">
                Organize articles into structured learning paths
              </p>
            </div>
            <Link
              to="/course/new"
              className="btn-outline inline-flex items-center gap-2 group"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Course
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="card-modern p-8 text-center animate-fade-in-up">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-[var(--color-text-muted)] mb-4">
                No courses created yet. Courses help you organize related articles into a structured learning path.
              </p>
              <Link
                to="/course/new"
                className="inline-flex items-center gap-2 text-[var(--color-primary)] font-medium hover:text-[var(--color-secondary)] transition-colors"
              >
                Create your first course
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 stagger-children">
              {courses.map((course, index) => (
                <div
                  key={course.id}
                  className="card-modern p-6 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                        {course.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">{course.title}</h3>
                          {course.published ? (
                            <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">Published</span>
                          ) : (
                            <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">Draft</span>
                          )}
                        </div>
                        {course.description && (
                          <p className="text-[var(--color-text-muted)] text-sm mb-2">
                            {course.description}
                          </p>
                        )}
                        <p className="text-xs text-[var(--color-text-muted)]">
                          {course.chapters.length} chapters
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/course/${course.id}`}
                        className="px-4 py-2 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] glass rounded-lg transition-all"
                      >
                        View
                      </Link>
                      <Link
                        to={`/course/${course.id}/edit`}
                        className="px-4 py-2 text-sm glass rounded-lg hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
