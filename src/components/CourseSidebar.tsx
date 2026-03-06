import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Course } from '../types';

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

interface CourseSidebarProps {
  course: Course;
  currentChapterId: string;
  progress?: Record<string, boolean>;
  headings?: TocHeading[];
  activeHeadingId?: string;
}

const CourseSidebar = ({ course, currentChapterId, progress = {}, headings = [], activeHeadingId }: CourseSidebarProps) => {
  const sortedChapters = [...course.chapters].sort((a, b) => a.order - b.order);
  const currentIndex = sortedChapters.findIndex(ch => ch.id === currentChapterId);
  
  // Track which chapters are expanded (current chapter is expanded by default)
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set([currentChapterId]));

  // Auto-expand current chapter when it changes
  useEffect(() => {
    setExpandedChapters(prev => new Set([...prev, currentChapterId]));
  }, [currentChapterId]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const scrollToHeading = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    // Blur the button to prevent sidebar from scrolling to keep focus visible
    (e.currentTarget as HTMLElement).blur();
    
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  return (
    <aside className="hidden lg:block w-72 flex-shrink-0 ml-6">
      <div className="glass rounded-xl p-6 sticky top-24 mt-24 overflow-y-auto max-h-[calc(100vh-120px)]">
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

      {/* Chapter List with Collapsible Headings */}
      <div className="relative">
        {sortedChapters.map((chapter, index) => {
          const isCompleted = progress[chapter.id];
          const isCurrent = chapter.id === currentChapterId;
          const isLast = index === sortedChapters.length - 1;
          const isExpanded = expandedChapters.has(chapter.id);
          const showHeadings = isCurrent && headings.length > 0;

          return (
            <div key={chapter.id} className="relative">
              {/* Main Chapter Row */}
              <div className="relative flex items-start group">
                {/* Vertical Line to next chapter */}
                {!isLast && (
                  <div 
                    className={`absolute left-[9px] top-5 w-0.5 transition-colors ${
                      isExpanded && showHeadings ? 'h-6' : 'h-full'
                    } ${
                      isCompleted || index < currentIndex
                        ? 'bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-secondary)]' 
                        : 'bg-[var(--color-border)]'
                    }`}
                  />
                )}

                {/* Dot */}
                <div className="relative z-10 mr-3 mt-0.5 flex-shrink-0">
                  {isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-green-400 flex items-center justify-center shadow-lg shadow-[var(--color-accent)]/30">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/50 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[var(--color-border)] bg-[var(--color-surface)] group-hover:border-[var(--color-primary)]/50 transition-colors" />
                  )}
                </div>

                {/* Chapter Link + Expand Button */}
                <div className="flex-1 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/course/${course.id}/chapter/${chapter.id}`}
                      className={`flex-1 ${
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
                    
                    {/* Expand/Collapse button - only show for current chapter with headings */}
                    {showHeadings && (
                      <button
                        onClick={() => toggleChapter(chapter.id)}
                        className="p-1 hover:bg-[var(--color-surface)] rounded transition-colors flex-shrink-0"
                        aria-label={isExpanded ? 'Collapse' : 'Expand'}
                      >
                        <svg 
                          className={`w-4 h-4 text-[var(--color-text-muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  
                  {/* Nested Headings (Table of Contents) - only for current chapter */}
                  {showHeadings && isExpanded && (
                    <div className="relative mt-3 ml-2 pl-3 border-l-2 border-[var(--color-border)]">
                      {headings.map((heading) => {
                        const isActive = activeHeadingId === heading.id;

                        return (
                          <div key={heading.id} className="relative flex items-start group/heading">
                            {/* Small dot for heading */}
                            <div className="relative z-10 mr-2 mt-1.5 flex-shrink-0">
                              {isActive ? (
                                <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)]" />
                              ) : (
                                <div className="w-2 h-2 rounded-full bg-[var(--color-border)] group-hover/heading:bg-[var(--color-primary)]/50 transition-colors" />
                              )}
                            </div>

                            {/* Heading Link */}
                            <button
                              onClick={(e) => scrollToHeading(e, heading.id)}
                              className={`flex-1 pb-2 text-left text-xs leading-tight transition-colors ${
                                heading.level === 2 ? 'pl-2' : ''
                              } ${
                                isActive 
                                  ? 'text-[var(--color-primary)] font-medium' 
                                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                              }`}
                            >
                              {heading.text}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Connector line after expanded headings section */}
              {!isLast && isExpanded && showHeadings && (
                <div 
                  className={`absolute left-[9px] bottom-0 w-0.5 h-4 ${
                    isCompleted || index < currentIndex
                      ? 'bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-secondary)]' 
                      : 'bg-[var(--color-border)]'
                  }`}
                />
              )}
              
              {/* Spacing after chapter */}
              {!showHeadings && <div className="pb-4" />}
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
    </aside>
  );
};

export default CourseSidebar;
