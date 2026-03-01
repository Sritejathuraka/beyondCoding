import { Link } from 'react-router-dom';
import type { Course } from '../types';
import { getCourseProgress } from '../services/courseService';

interface CourseSidebarProps {
  course: Course;
  currentArticleId: string;
}

const CourseSidebar = ({ course, currentArticleId }: CourseSidebarProps) => {
  const progress = getCourseProgress(course.id);
  const sortedChapters = [...course.chapters].sort((a, b) => a.order - b.order);
  const currentIndex = sortedChapters.findIndex(ch => ch.articleId === currentArticleId);

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] p-6 sticky top-24">
      {/* Course Title */}
      <Link 
        to={`/course/${course.id}`}
        className="text-sm font-medium text-[var(--color-primary)] hover:underline mb-1 block"
      >
        {course.icon} {course.title}
      </Link>
      
      <p className="text-xs text-[var(--color-text-muted)] mb-6">
        {sortedChapters.length} chapters · {course.estimatedTime}
      </p>

      {/* Chapter List with Dot Connector */}
      <div className="relative">
        {sortedChapters.map((chapter, index) => {
          const isCompleted = progress[chapter.id];
          const isCurrent = chapter.articleId === currentArticleId;
          const isLast = index === sortedChapters.length - 1;

          return (
            <div key={chapter.id} className="relative flex items-start">
              {/* Vertical Line */}
              {!isLast && (
                <div 
                  className={`absolute left-[9px] top-5 w-0.5 h-full ${
                    isCompleted || index < currentIndex
                      ? 'bg-[var(--color-primary)]' 
                      : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Dot */}
              <div className="relative z-10 mr-3 mt-0.5">
                {isCompleted ? (
                  // Completed checkmark
                  <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isCurrent ? (
                  // Current - filled dot with ring
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] bg-[var(--color-primary)] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                ) : (
                  // Not started - empty dot
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 bg-white" />
                )}
              </div>

              {/* Chapter Link */}
              <Link
                to={`/article/${chapter.articleId}`}
                className={`flex-1 pb-6 ${
                  isCurrent 
                    ? 'text-[var(--color-text)] font-medium' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                } transition-colors`}
              >
                <span className="text-xs text-[var(--color-text-muted)] block mb-0.5">
                  Chapter {index + 1}
                </span>
                <span className={`text-sm leading-tight block ${
                  isCurrent ? 'text-[var(--color-text)]' : ''
                }`}>
                  {chapter.title}
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-2">
          <span>Progress</span>
          <span>{Object.keys(progress).length}/{sortedChapters.length} completed</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
            style={{ 
              width: `${(Object.keys(progress).length / sortedChapters.length) * 100}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseSidebar;
