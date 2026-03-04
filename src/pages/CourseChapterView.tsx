import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar, Footer, CourseSidebar } from '../components';
import SignInPrompt from '../components/SignInPrompt';
import { getArticleById, type StoredArticle, formatDate } from '../services/articleService';
import { getCourseById, markChapterComplete, getChapterProgress, type Course, type CourseChapter } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';

const CourseChapterView = () => {
  const { courseId, articleId } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState<StoredArticle | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (courseId && articleId) {
        const [foundCourse, found] = await Promise.all([
          getCourseById(courseId),
          getArticleById(articleId)
        ]);
        setCourse(foundCourse);
        setArticle(found);
        
        if (foundCourse) {
          const courseProgress = await getChapterProgress(foundCourse.id);
          setProgress(courseProgress);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [courseId, articleId]);

  // Find the current chapter by articleId
  const getCurrentChapter = (): CourseChapter | null => {
    if (!course || !articleId) return null;
    return course.chapters.find((c: CourseChapter) => c.articleId === articleId) || null;
  };

  const handleMarkComplete = async () => {
    if (!user) {
      setShowSignInPrompt(true);
      return;
    }
    
    const currentChapter = getCurrentChapter();
    if (course && currentChapter) {
      await markChapterComplete(course.id, currentChapter.id);
      // Refresh progress
      const updatedProgress = await getChapterProgress(course.id);
      setProgress(updatedProgress);
    }
  };

  const handleContinueWithoutSaving = async () => {
    const currentChapter = getCurrentChapter();
    if (course && currentChapter) {
      await markChapterComplete(course.id, currentChapter.id);
      const updatedProgress = await getChapterProgress(course.id);
      setProgress(updatedProgress);
    }
    setShowSignInPrompt(false);
  };

  const isChapterComplete = () => {
    const currentChapter = getCurrentChapter();
    if (!currentChapter) return false;
    return progress[currentChapter.id] || false;
  };

  const getCurrentChapterIndex = () => {
    if (!course || !articleId) return -1;
    return course.chapters.findIndex((c: CourseChapter) => c.articleId === articleId);
  };

  const getNextChapter = () => {
    if (!course) return null;
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex === -1 || currentIndex >= course.chapters.length - 1) return null;
    return course.chapters[currentIndex + 1];
  };

  const getPrevChapter = () => {
    if (!course) return null;
    const currentIndex = getCurrentChapterIndex();
    if (currentIndex <= 0) return null;
    return course.chapters[currentIndex - 1];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 pt-32 pb-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
            <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-[var(--color-text)]">Course not found</h1>
          <p className="text-[var(--color-text-muted)] mb-8">
            The course you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/courses" className="btn-primary inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Browse Courses
          </Link>
        </main>
        <Footer />
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
          <h1 className="text-3xl font-bold mb-4 text-[var(--color-text)]">Chapter not found</h1>
          <p className="text-[var(--color-text-muted)] mb-8">
            This chapter doesn't exist or has been removed from the course.
          </p>
          <Link to={`/course/${courseId}`} className="btn-primary inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Course
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const prevChapter = getPrevChapter();
  const nextChapter = getNextChapter();
  const currentIndex = getCurrentChapterIndex();

  return (
    <div className="min-h-screen bg-[var(--color-background)] overflow-x-hidden">
      <Navbar />
      
      <div className="flex">
        {/* Course Sidebar */}
        <CourseSidebar course={course} currentArticleId={articleId!} progress={progress} />
        
        <main className="flex-1 max-w-3xl px-6 pt-32 pb-20 overflow-hidden animate-fade-in-up">
          {/* Course Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <Link 
                to={`/course/${course.id}`}
                className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
              >
                <span>{course.icon}</span>
                <span>{course.title}</span>
              </Link>
              <span className="text-sm text-[var(--color-text-muted)]">
                Chapter {currentIndex + 1} of {course.chapters.length}
              </span>
            </div>
            <div className="w-full h-1 bg-[var(--color-border)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / course.chapters.length) * 100}%` }}
              />
            </div>
          </div>

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
            
            <div className="flex items-center gap-4 pb-8 border-b border-[var(--color-border)]">
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
          </header>

          {/* Article Content */}
          <article 
            className="prose prose-lg max-w-none overflow-hidden prose-headings:text-[var(--color-text)] prose-p:text-[var(--color-text-muted)] prose-a:text-[var(--color-primary)] prose-strong:text-[var(--color-text)] prose-code:text-[var(--color-secondary)] prose-pre:bg-[#f8fafc] prose-pre:border prose-pre:border-[var(--color-border)]"
            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Chapter Navigation */}
          <footer className="mt-12 pt-8 border-t border-[var(--color-border)]">
            {/* Mark Complete Button */}
            <div className="flex justify-center mb-8">
              {isChapterComplete() ? (
                <div className="flex items-center gap-2 text-[var(--color-accent)] px-6 py-3 glass rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Chapter Completed</span>
                </div>
              ) : (
                <button
                  onClick={handleMarkComplete}
                  className="btn-primary flex items-center gap-2 group"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Complete
                </button>
              )}
            </div>

            {/* Prev/Next Navigation */}
            <div className="flex items-center justify-between gap-4">
              {prevChapter ? (
                <Link
                  to={`/course/${course.id}/chapter/${prevChapter.articleId}`}
                  className="flex-1 p-4 glass rounded-xl hover:border-[var(--color-primary)] transition-all group"
                >
                  <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Previous</span>
                  <p className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {prevChapter.title}
                  </p>
                </Link>
              ) : (
                <div className="flex-1" />
              )}
              
              {nextChapter ? (
                <Link
                  to={`/course/${course.id}/chapter/${nextChapter.articleId}`}
                  className="flex-1 p-4 glass rounded-xl hover:border-[var(--color-primary)] transition-all group text-right"
                >
                  <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Next</span>
                  <p className="font-medium text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors flex items-center justify-end gap-2">
                    {nextChapter.title}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </p>
                </Link>
              ) : (
                <Link
                  to={`/course/${course.id}`}
                  className="flex-1 p-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white rounded-xl transition-all group text-right"
                >
                  <span className="text-xs uppercase tracking-wider opacity-80">Congratulations!</span>
                  <p className="font-medium flex items-center justify-end gap-2">
                    Course Complete 🎉
                  </p>
                </Link>
              )}
            </div>
          </footer>
        </main>
      </div>
      
      <Footer />
      
      {/* Sign In Prompt Modal */}
      <SignInPrompt
        isOpen={showSignInPrompt}
        onClose={() => setShowSignInPrompt(false)}
        onContinueWithoutSaving={handleContinueWithoutSaving}
      />
    </div>
  );
};

export default CourseChapterView;
