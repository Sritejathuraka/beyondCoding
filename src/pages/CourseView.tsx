import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import { getCourseById, getCourseProgress, getCourseCompletionPercent } from '../services/courseService';
import type { Course } from '../types';

const CourseView = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) {
      const found = getCourseById(id);
      setCourse(found);
      if (found) {
        setProgress(getCourseProgress(found.id));
      }
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <p className="text-[var(--color-text-muted)]">Loading...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <Navbar />
        <main className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Course not found</h1>
          <p className="text-[var(--color-text-muted)] mb-8">
            The course you're looking for doesn't exist or has been removed.
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

  const sortedChapters = [...course.chapters].sort((a, b) => a.order - b.order);
  const completedCount = Object.keys(progress).length;
  const completionPercent = getCourseCompletionPercent(course);
  const firstIncompleteChapter = sortedChapters.find(ch => !progress[ch.id]);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Course Header */}
        <div className="bg-white rounded-2xl p-8 border border-[var(--color-border)] mb-8">
          <div className="flex items-start gap-6">
            {/* Icon */}
            <div className="text-5xl">{course.icon}</div>

            <div className="flex-1">
              {/* Category */}
              <span className="inline-block px-3 py-1 bg-[#fbe8de] text-[var(--color-primary)] text-xs font-medium rounded-full mb-3">
                {course.category}
              </span>

              {/* Title */}
              <h1 className="text-3xl font-bold mb-3">{course.title}</h1>

              {/* Description */}
              <p className="text-[var(--color-text-muted)] mb-4">
                {course.description}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                <span>{course.chapters.length} chapters</span>
                <span>·</span>
                <span>{course.estimatedTime}</span>
                <span>·</span>
                <span>By {course.author}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Your Progress</span>
              <span className="text-sm text-[var(--color-text-muted)]">
                {completedCount}/{course.chapters.length} chapters ({completionPercent}%)
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            
            {/* Start/Continue Button */}
            <div className="mt-4">
              {firstIncompleteChapter ? (
                <Link
                  to={`/article/${firstIncompleteChapter.articleId}`}
                  className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-full font-medium hover:bg-[#a84a3a] transition-colors"
                >
                  {completedCount > 0 ? 'Continue Learning' : 'Start Course'}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 text-green-600 font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Course Completed!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <h2 className="text-xl font-bold mb-4">Course Chapters</h2>

        <div className="space-y-3">
          {sortedChapters.map((chapter, index) => {
            const isCompleted = progress[chapter.id];
            const isNext = !isCompleted && (index === 0 || progress[sortedChapters[index - 1]?.id]);

            return (
              <Link
                key={chapter.id}
                to={`/article/${chapter.articleId}`}
                className={`flex items-center gap-4 p-5 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-green-50 border-green-200 hover:border-green-300'
                    : isNext
                    ? 'bg-[#fbe8de] border-[var(--color-primary)] hover:shadow-md'
                    : 'bg-white border-[var(--color-border)] hover:border-gray-300'
                }`}
              >
                {/* Status Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isNext
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-gray-100 text-gray-400'
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
                  <h3 className={`font-medium ${isCompleted ? 'text-green-800' : ''}`}>
                    {chapter.title}
                  </h3>
                </div>

                {/* Arrow */}
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseView;
