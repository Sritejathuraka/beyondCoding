import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../components';
import { getPublishedCourses, type Course } from '../services/courseService';

const CoursesPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      const data = await getPublishedCourses();
      setCourses(data);
      setLoading(false);
    };
    loadCourses();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20 blur-3xl pointer-events-none" />
          <span className="text-[var(--color-primary)] text-sm font-medium uppercase tracking-wider mb-4 block relative">Learn & Grow</span>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 relative">
            <span className="text-[var(--color-text)]">Explore </span>
            <span className="gradient-text">Courses</span>
          </h1>
          <p className="text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto relative">
            Structured learning paths to help you master new skills step by step.
          </p>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-16 animate-fade-in-up">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center">
              <svg className="w-10 h-10 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-[var(--color-text-muted)] text-lg">
              No courses available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 stagger-children">
            {courses.map((course, index) => {
              const completedCount = course.chapters.filter(c => c.completed).length;
              const progressPercent = course.chapters.length > 0 
                ? Math.round((completedCount / course.chapters.length) * 100)
                : 0;
              
              return (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="card-modern group relative overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient accent on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)]/5 to-[var(--color-secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                        {course.icon}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                          {course.title}
                        </h2>
                        {course.description && (
                          <p className="text-[var(--color-text-muted)] mt-1 line-clamp-2">
                            {course.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">{course.chapters.length} chapters</span>
                      {completedCount > 0 && (
                        <span className="text-[var(--color-accent)] font-medium">
                          {completedCount}/{course.chapters.length} completed
                        </span>
                      )}
                    </div>
                    
                    {/* Progress bar */}
                    <div className="mt-4 h-2 bg-[var(--color-surface)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    
                    {/* Arrow indicator */}
                    <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-[var(--color-surface)] flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <svg className="w-5 h-5 text-[var(--color-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default CoursesPage;
