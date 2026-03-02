import { Link } from 'react-router-dom';
import type { Course } from '../types';

interface CourseSidebarProps {
  course: Course;
  currentArticleId: string;
  progress?: Record<string, boolean>;
}

const CourseSidebar = ({ course, currentArticleId, progress = {} }: CourseSidebarProps) => {
  const sortedChapters = [...course.chapters].sort((a, b) => a.order - b.order);
  const currentIndex = sortedChapters.findIndex(ch => ch.articleId === currentArticleId);

  return (
    <div className="glass rounded-xl p-6 sticky top-28 mt-32 ml-6 max-w-xs hidden lg:block">
      {/* Course Title */}
      <Link 
        to={`/course/${course.id}`}
        className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-secondary)] transition-colors mb-1 flex items-center gap-2"
      >
        <span className="text-lg">{course.icon}</span>
        <span>{course.title}</span>
      </Link>
      
      <p className="text-xs text-[var(--color-text-muted)] mb-6 ml-7">
        {sortedChapters.length} chapters · {course.estimatedTime}
      </p>

      {/* Chapter List with Dot Connector */}
      <div className="relative">
        {sortedChapters.map((chapter, index) => {
          const isCompleted = progress[chapter.id];
          const isCurrent = chapter.articleId === currentArticleId;
          const isLast = index === sortedChapters.length - 1;

          return (
            <div key={chapter.id} className="relative flex items-start group">
              {/* Vertical Line */}
              {!isLast && (
                <div 
                  className={`absolute left-[9px] top-5 w-0.5 h-full transition-colors ${
                    isCompleted || index < currentIndex
                      ? 'bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-secondary)]' 
                      : 'bg-[var(--color-border)]'
                  }`}
                />
              )}

              {/* Dot */}
              <div className="relative z-10 mr-3 mt-0.5">
                {isCompleted ? (
                  // Completed checkmark
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-green-400 flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/30">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : isCurrent ? (
                  // Current - filled dot with ring and glow
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/50 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                ) : (
                  // Not started - empty dot
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--color-border)] bg-[var(--color-surface)] group-hover:border-[var(--color-primary)]/50 transition-colors" />
                )}
              </div>

              {/* Chapter Link */}
              <Link
                to={`/course/${course.id}/chapter/${chapter.articleId}`}
                className={`flex-1 pb-6 ${
                  isCurrent 
                    ? 'text-[var(--color-text)]' 
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                } transition-colors`}
              >
                <span className="text-xs text-[var(--color-text-muted)] block mb-0.5">
                  Chapter {index + 1}
                </span>
                <span className={`text-sm leading-tight block ${
                  isCurrent ? 'font-medium gradient-text' : ''
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
          <span className="gradient-text font-medium">{Object.keys(progress).length}/{sortedChapters.length}</span>
        </div>
        <div className="h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full transition-all duration-500"
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
