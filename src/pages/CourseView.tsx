import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import { getCourseById, getChapterProgress, deleteCourse } from '../services/courseService';
import { useAuth } from '../contexts/AuthContext';
import type { Course } from '../types';

const CourseView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, canWrite } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!course || !id) return;
    if (window.confirm(`Are you sure you want to delete the course "${course.title}"? This will also delete all chapter associations. This action cannot be undone.`)) {
      setDeleting(true);
      try {
        await deleteCourse(id);
        navigate('/courses');
      } catch {
        alert('Failed to delete course. Please try again.');
        setDeleting(false);
      }
    }
  };

  useEffect(() => {
    const loadCourse = async () => {
      if (id) {
        const found = await getCourseById(id);
        setCourse(found);
        if (found) {
          // Fetch progress from Supabase for logged-in users
          const courseProgress = await getChapterProgress(found.id);
          setProgress(courseProgress);
        }
      }
      setLoading(false);
    };
    loadCourse();
  }, [id]);

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-[var(--color-text)]">Course not found</h1>
          <p className="text-[var(--color-text-muted)] mb-8">
            The course you're looking for doesn't exist or has been removed.
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

  const sortedChapters = [...course.chapters].sort((a, b) => a.order - b.order);
  const completedCount = Object.values(progress).filter(Boolean).length;
  const completionPercent = course.chapters.length > 0 
    ? Math.round((completedCount / course.chapters.length) * 100) 
    : 0;
  const firstIncompleteChapter = sortedChapters.find(ch => !progress[ch.id]);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        {/* Course Header */}
        <div className="card-gradient-border overflow-hidden mb-10 animate-fade-in-up">
          <div className="relative p-8">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative flex items-start gap-6">
              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-4xl shadow-lg">
                {course.icon}
              </div>

              <div className="flex-1">
                {/* Category */}
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 text-[var(--color-primary)] text-xs font-medium rounded-full mb-3">
                  {course.category}
                </span>

                {/* Title */}
                <h1 className="text-3xl font-bold mb-3 text-[var(--color-text)]">{course.title}</h1>

                {/* Description */}
                <p className="text-[var(--color-text-muted)] mb-4">
                  {course.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    {course.chapters.length} chapters
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {course.estimatedTime}
                  </span>
                  <span>·</span>
                  <span>By {course.author}</span>
                  
                  {/* Admin Controls */}
                  {canWrite && (
                    <>
                      <span>·</span>
                      <Link
                        to={`/course/${course.id}/edit`}
                        className="text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors flex items-center gap-1"
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
                          className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 disabled:opacity-50"
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
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="relative mt-8 pt-6 border-t border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[var(--color-text)]">Your Progress</span>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {completedCount}/{course.chapters.length} chapters ({completionPercent}%)
                </span>
              </div>
              <div className="h-3 bg-[var(--color-surface)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              
              {/* Start/Continue Button */}
              <div className="mt-6">
                {firstIncompleteChapter ? (
                  <Link
                    to={`/course/${course.id}/chapter/${firstIncompleteChapter.id}`}
                    className="btn-primary inline-flex items-center gap-2 group"
                  >
                    {completedCount > 0 ? 'Continue Learning' : 'Start Course'}
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-2 text-[var(--color-accent)] font-medium">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Course Completed!
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl font-bold mb-6 text-[var(--color-text)]">Course <span className="gradient-text">Chapters</span></h2>

          <div className="space-y-3 stagger-children">
            {sortedChapters.map((chapter, index) => {
              const isCompleted = progress[chapter.id];
              const isNext = !isCompleted && (index === 0 || progress[sortedChapters[index - 1]?.id]);

              return (
                <Link
                  key={chapter.id}
                  to={`/course/${course.id}/chapter/${chapter.id}`}
                  className={`flex items-center gap-4 p-5 rounded-xl border transition-all group ${
                    isCompleted
                      ? 'bg-[var(--color-accent)]/10 border-[var(--color-accent)]/30 hover:border-[var(--color-accent)]'
                      : isNext
                      ? 'bg-gradient-to-r from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 border-[var(--color-primary)] shadow-glow'
                      : 'bg-[var(--color-card)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Status Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isCompleted
                      ? 'bg-[var(--color-accent)] text-white'
                      : isNext
                      ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white'
                      : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
                  }`}>
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <span className="text-xs text-[var(--color-text-muted)]">
                      Chapter {index + 1}
                    </span>
                    <h3 className={`font-medium ${
                      isCompleted ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)] group-hover:text-[var(--color-primary)]'
                    } transition-colors`}>
                      {chapter.title}
                    </h3>
                  </div>

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-all group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseView;
