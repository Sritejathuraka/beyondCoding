import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import { 
  getArticles, 
  deleteArticle, 
  type StoredArticle,
  formatDate 
} from '../services/articleService';
import { getCourses, deleteCourse, type Course } from '../services/courseService';

const Dashboard = () => {
  const [articles, setArticles] = useState<StoredArticle[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'drafts'>('all');

  useEffect(() => {
    loadArticles();
    loadCourses();
  }, []);

  const loadArticles = () => {
    setArticles(getArticles());
  };

  const loadCourses = () => {
    setCourses(getCourses());
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteArticle(id);
      loadArticles();
    }
  };

  const handleDeleteCourse = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the course "${title}"?`)) {
      deleteCourse(id);
      loadCourses();
    }
  };

  const filteredArticles = articles.filter(article => {
    if (filter === 'published') return article.published;
    if (filter === 'drafts') return !article.published;
    return true;
  });

  const publishedCount = articles.filter(a => a.published).length;
  const draftsCount = articles.filter(a => !a.published).length;

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Articles</h1>
            <p className="text-[var(--color-text-muted)]">
              Manage your drafts and published articles
            </p>
          </div>
          <Link
            to="/write"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-full font-medium hover:bg-[#a84a3a] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Write New Article
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
            <p className="text-2xl font-bold">{articles.length}</p>
            <p className="text-sm text-[var(--color-text-muted)]">Total Articles</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
            <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
            <p className="text-sm text-[var(--color-text-muted)]">Published</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-[var(--color-border)]">
            <p className="text-2xl font-bold text-yellow-600">{draftsCount}</p>
            <p className="text-sm text-[var(--color-text-muted)]">Drafts</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-[var(--color-text)] text-white' 
                : 'bg-white border border-[var(--color-border)] hover:bg-gray-50'
            }`}
          >
            All ({articles.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'published' 
                ? 'bg-[var(--color-text)] text-white' 
                : 'bg-white border border-[var(--color-border)] hover:bg-gray-50'
            }`}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setFilter('drafts')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'drafts' 
                ? 'bg-[var(--color-text)] text-white' 
                : 'bg-white border border-[var(--color-border)] hover:bg-gray-50'
            }`}
          >
            Drafts ({draftsCount})
          </button>
        </div>

        {/* Articles List */}
        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-xl p-12 border border-[var(--color-border)] text-center">
            <p className="text-[var(--color-text-muted)] mb-4">
              {filter === 'all' 
                ? "You haven't written any articles yet." 
                : filter === 'published'
                  ? "No published articles yet."
                  : "No drafts saved."}
            </p>
            <Link
              to="/write"
              className="inline-block text-[var(--color-primary)] font-medium hover:underline"
            >
              Write your first article →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-xl p-6 border border-[var(--color-border)] hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        article.published 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {article.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-1">
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
                        className="px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                      >
                        View
                      </Link>
                    )}
                    <Link
                      to={`/write/${article.id}`}
                      className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id, article.title)}
                      className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Your Courses</h2>
              <p className="text-[var(--color-text-muted)]">
                Organize articles into structured learning paths
              </p>
            </div>
            <Link
              to="/course/new"
              className="inline-flex items-center gap-2 border border-[var(--color-primary)] text-[var(--color-primary)] px-5 py-2 rounded-full font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Course
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-[var(--color-border)] text-center">
              <p className="text-[var(--color-text-muted)] mb-4">
                No courses created yet. Courses help you organize related articles into a structured learning path.
              </p>
              <Link
                to="/course/new"
                className="inline-block text-[var(--color-primary)] font-medium hover:underline"
              >
                Create your first course →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl p-6 border border-[var(--color-border)] hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{course.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{course.title}</h3>
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
                        className="px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        to={`/course/${course.id}/edit`}
                        className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
