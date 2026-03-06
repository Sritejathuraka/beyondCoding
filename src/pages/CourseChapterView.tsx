import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar, Footer, CourseSidebar, ArticleContent } from '../components';
import { extractHeadings, type Heading } from '../components/ArticleContent';
import SignInPrompt from '../components/SignInPrompt';
import { getArticleById, type StoredArticle, formatDate } from '../services/articleService';
import { getCourseById, markChapterComplete, getChapterProgress, type Course, type CourseChapter } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';

const CourseChapterView = () => {
  const { courseId, chapterId } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState<StoredArticle | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [currentChapter, setCurrentChapter] = useState<CourseChapter | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');

  // Track active heading based on scroll position
  const updateActiveHeading = useCallback(() => {
    if (headings.length === 0) return;
    
    const scrollY = window.scrollY;
    const offset = 120; // Account for navbar
    
    // Find the heading that's currently in view
    for (let i = headings.length - 1; i >= 0; i--) {
      const element = document.getElementById(headings[i].id);
      if (element) {
        const rect = element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        
        if (scrollY >= elementTop - offset) {
          setActiveHeadingId(headings[i].id);
          return;
        }
      }
    }
    
    // Default to first heading if scrolled to top
    if (headings.length > 0) {
      setActiveHeadingId(headings[0].id);
    }
  }, [headings]);

  // Add scroll listener for active heading tracking
  useEffect(() => {
    if (headings.length === 0) return;
    
    window.addEventListener('scroll', updateActiveHeading, { passive: true });
    updateActiveHeading(); // Initial check
    
    return () => window.removeEventListener('scroll', updateActiveHeading);
  }, [headings, updateActiveHeading]);

  useEffect(() => {
    const loadData = async () => {
      if (courseId && chapterId) {
        // First load the course to find the chapter
        const foundCourse = await getCourseById(courseId);
        setCourse(foundCourse);
        
        if (foundCourse) {
          // Find the chapter by ID
          const chapter = foundCourse.chapters.find(ch => ch.id === chapterId);
          setCurrentChapter(chapter || null);
          
          // If chapter is linked to an article, fetch the article
          if (chapter?.articleId) {
            const foundArticle = await getArticleById(chapter.articleId);
            setArticle(foundArticle);
          }
          
          const courseProgress = await getChapterProgress(foundCourse.id);
          setProgress(courseProgress);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [courseId, chapterId]);

  const handleMarkComplete = async () => {
    if (!user) {
      setShowSignInPrompt(true);
      return;
    }
    
    if (course && currentChapter) {
      await markChapterComplete(course.id, currentChapter.id);
      // Refresh progress
      const updatedProgress = await getChapterProgress(course.id);
      setProgress(updatedProgress);
    }
  };

  const handleContinueWithoutSaving = async () => {
    if (course && currentChapter) {
      await markChapterComplete(course.id, currentChapter.id);
      const updatedProgress = await getChapterProgress(course.id);
      setProgress(updatedProgress);
    }
    setShowSignInPrompt(false);
  };

  const isChapterComplete = () => {
    if (!currentChapter) return false;
    return progress[currentChapter.id] || false;
  };

  const getCurrentChapterIndex = () => {
    if (!course || !chapterId) return -1;
    return course.chapters.findIndex((c: CourseChapter) => c.id === chapterId);
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

  // Get content and metadata - from article or standalone chapter
  const getChapterContent = () => {
    if (article) {
      return article.content;
    }
    return currentChapter?.content || '';
  };

  // Extract headings when content changes
  useEffect(() => {
    const content = getChapterContent();
    if (content) {
      const extracted = extractHeadings(content);
      setHeadings(extracted);
    } else {
      setHeadings([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article, currentChapter]);

  const getChapterTitle = () => {
    if (article) return article.title;
    return currentChapter?.title || 'Chapter';
  };

  const getChapterDescription = () => {
    if (article) return article.description;
    return currentChapter?.description || '';
  };

  const getChapterMeta = () => {
    if (article) {
      return {
        author: article.author,
        date: formatDate(article.createdAt),
        readTime: article.readTime,
        category: article.category,
      };
    }
    return {
      author: course?.author || 'Author',
      date: course?.createdAt ? formatDate(course.createdAt) : '',
      readTime: course?.estimatedTime || '',
      category: course?.category || 'Course',
    };
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

  if (!currentChapter) {
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
  const chapterMeta = getChapterMeta();

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />
      
      <div className="flex">
        {/* Course Sidebar */}
        <CourseSidebar 
          course={course} 
          currentChapterId={chapterId!} 
          progress={progress}
          headings={headings}
          activeHeadingId={activeHeadingId}
        />
        
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
              {chapterMeta.category}
            </span>
            
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 text-[var(--color-text)]">
              {getChapterTitle()}
            </h1>
            
            {getChapterDescription() && (
              <p className="text-xl text-[var(--color-text-muted)] mb-6">
                {getChapterDescription()}
              </p>
            )}
            
            <div className="flex items-center gap-4 pb-8 border-b border-[var(--color-border)]">
              <div className="w-12 h-12 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center text-white font-medium">
                ST
              </div>
              <div>
                <p className="font-medium text-[var(--color-text)]">{chapterMeta.author}</p>
                {(chapterMeta.date || chapterMeta.readTime) && (
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {chapterMeta.date}{chapterMeta.date && chapterMeta.readTime && ' · '}{chapterMeta.readTime}
                  </p>
                )}
              </div>
            </div>
          </header>

          {/* Article Content */}
          <ArticleContent 
            content={getChapterContent()}
            className="prose prose-lg max-w-none overflow-hidden prose-headings:text-[var(--color-text)] prose-p:text-[var(--color-text-muted)] prose-a:text-[var(--color-primary)] prose-strong:text-[var(--color-text)] prose-code:text-[var(--color-secondary)] prose-pre:bg-[#f8fafc] prose-pre:border prose-pre:border-[var(--color-border)]"
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
                  to={`/course/${course.id}/chapter/${prevChapter.id}`}
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
                  to={`/course/${course.id}/chapter/${nextChapter.id}`}
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
