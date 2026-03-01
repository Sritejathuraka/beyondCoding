import type { Course, CourseChapter } from '../types';

// Re-export types for convenience
export type { Course, CourseChapter };

const COURSES_KEY = 'beyondcode_courses';
const PROGRESS_KEY = 'beyondcode_course_progress';

// Get all courses
export const getCourses = (): Course[] => {
  const stored = localStorage.getItem(COURSES_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

// Get published courses only
export const getPublishedCourses = (): Course[] => {
  return getCourses().filter(course => course.published);
};

// Get course by ID
export const getCourseById = (id: string): Course | null => {
  const courses = getCourses();
  return courses.find(course => course.id === id) || null;
};

// Get course containing a specific article
export const getCourseByArticleId = (articleId: string): Course | null => {
  const courses = getCourses();
  return courses.find(course => 
    course.chapters.some(chapter => chapter.articleId === articleId)
  ) || null;
};

// Save a new course
export const saveCourse = (course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>): Course => {
  const courses = getCourses();
  const now = new Date().toISOString();
  
  const newCourse: Course = {
    ...course,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  
  courses.unshift(newCourse);
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  return newCourse;
};

// Update a course
export const updateCourse = (id: string, updates: Partial<Course>): Course | null => {
  const courses = getCourses();
  const index = courses.findIndex(course => course.id === id);
  
  if (index === -1) return null;
  
  courses[index] = {
    ...courses[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  return courses[index];
};

// Delete a course
export const deleteCourse = (id: string): boolean => {
  const courses = getCourses();
  const filtered = courses.filter(course => course.id !== id);
  
  if (filtered.length === courses.length) return false;
  
  localStorage.setItem(COURSES_KEY, JSON.stringify(filtered));
  return true;
};

// Progress Tracking
interface CourseProgress {
  [courseId: string]: {
    [chapterId: string]: boolean;
  };
}

export const getProgress = (): CourseProgress => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
};

export const getCourseProgress = (courseId: string): Record<string, boolean> => {
  const progress = getProgress();
  return progress[courseId] || {};
};

export const markChapterComplete = (courseId: string, chapterId: string): void => {
  const progress = getProgress();
  if (!progress[courseId]) {
    progress[courseId] = {};
  }
  progress[courseId][chapterId] = true;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

export const markChapterIncomplete = (courseId: string, chapterId: string): void => {
  const progress = getProgress();
  if (progress[courseId]) {
    delete progress[courseId][chapterId];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }
};

export const getCourseCompletionPercent = (course: Course): number => {
  const progress = getCourseProgress(course.id);
  const completedCount = Object.values(progress).filter(Boolean).length;
  return Math.round((completedCount / course.chapters.length) * 100) || 0;
};

// Get next/previous chapters
export const getAdjacentChapters = (course: Course, currentArticleId: string): {
  prev: CourseChapter | null;
  next: CourseChapter | null;
  current: CourseChapter | null;
  currentIndex: number;
} => {
  const sortedChapters = [...course.chapters].sort((a, b) => a.order - b.order);
  const currentIndex = sortedChapters.findIndex(ch => ch.articleId === currentArticleId);
  
  return {
    prev: currentIndex > 0 ? sortedChapters[currentIndex - 1] : null,
    next: currentIndex < sortedChapters.length - 1 ? sortedChapters[currentIndex + 1] : null,
    current: currentIndex >= 0 ? sortedChapters[currentIndex] : null,
    currentIndex,
  };
};
