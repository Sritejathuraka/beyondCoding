import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar, Footer, CourseSidebar } from '../components';
import { getArticleById, type StoredArticle, formatDate } from '../services/articleService';
import { getCourseByArticleId, markChapterComplete, type Course, type CourseChapter } from '../services/courseService';

const ArticleView = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<StoredArticle | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const found = getArticleById(id);
      setArticle(found);
      
      // Check if article is part of a course
      const foundCourse = getCourseByArticleId(id);
      setCourse(foundCourse);
    }
    setLoading(false);
  }, [id]);

  const handleMarkComplete = () => {
    if (course && id) {
      markChapterComplete(course.id, id);
      // Refresh course data
      const updatedCourse = getCourseByArticleId(id);
      setCourse(updatedCourse);
    }
  };

  const isChapterComplete = () => {
    if (!course || !id) return false;
    const chapter = course.chapters.find((c: CourseChapter) => c.articleId === id);
    return chapter?.completed || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Loading...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Article not found</h1>
          <p className="text-[var(--color-text-muted)] mb-8">
            The article you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/"
            className="inline-block bg-[var(--color-text)] text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    'ANDROID': 'bg-red-50 text-red-600',
    'IOS': 'bg-gray-100 text-gray-600',
    'FIREBASE': 'bg-orange-50 text-orange-600',
    'AI ENGINEERING': 'bg-pink-50 text-pink-600',
    'MACHINE LEARNING': 'bg-purple-50 text-purple-600',
    'PERFORMANCE': 'bg-yellow-50 text-yellow-600',
    'ARCHITECTURE': 'bg-blue-50 text-blue-600',
    'CAREER': 'bg-green-50 text-green-600',
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] overflow-x-hidden">
      <Navbar />
      
      <div className={`${course ? 'flex' : ''}`}>
        {/* Course Sidebar */}
        {course && id && (
          <CourseSidebar course={course} currentArticleId={id} />
        )}
        
        <main className={`${course ? 'flex-1 max-w-3xl' : 'max-w-3xl mx-auto'} px-6 py-12 overflow-hidden`}>
          {/* Course Badge */}
          {course && (
            <div className="mb-6">
              <Link 
                to={`/course/${course.id}`}
                className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
              >
                <span>📚</span>
                <span>Part of: {course.title}</span>
              </Link>
            </div>
          )}
        {/* Article Header */}
        <header className="mb-8">
          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-4 ${categoryColors[article.category] || 'bg-gray-100 text-gray-600'}`}>
            {article.category}
          </span>
          
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            {article.title}
          </h1>
          
          {article.description && (
            <p className="text-xl text-[var(--color-text-muted)] mb-6">
              {article.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 pb-8 border-b border-[var(--color-border)]">
            <div className="w-12 h-12 bg-[var(--color-text-muted)] rounded-full flex items-center justify-center text-white font-medium">
              ST
            </div>
            <div>
              <p className="font-medium">{article.author}</p>
              <p className="text-sm text-[var(--color-text-muted)]">
                {formatDate(article.createdAt)} · {article.readTime}
              </p>
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article 
          className="prose prose-lg max-w-none overflow-hidden"
          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Article Footer */}
        <footer className="mt-12 pt-8 border-t border-[var(--color-border)]">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors flex items-center gap-2"
            >
              ← Back to all articles
            </Link>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-[var(--color-text-muted)]">Share:</span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                Twitter
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
          
          {/* Mark Complete Button for Course */}
          {course && (
            <div className="mt-8 flex justify-center">
              {isChapterComplete() ? (
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Chapter Completed</span>
                </div>
              ) : (
                <button
                  onClick={handleMarkComplete}
                  className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Complete
                </button>
              )}
            </div>
          )}
        </footer>
      </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default ArticleView;
