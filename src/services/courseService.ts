import type { Course, CourseChapter } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { notifySubscribers } from './subscriberService';

// Re-export types for convenience
export type { Course, CourseChapter };

const COURSES_KEY = 'beyondcode_courses';
const PROGRESS_KEY = 'beyondcode_course_progress';

// Database row types (snake_case from Supabase)
interface CourseRow {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  category: string;
  author: string;
  estimated_time: string | null;
  published: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ChapterRow {
  id: string;
  course_id: string;
  article_id: string;
  title: string;
  chapter_order: number;
}

// Convert database row to Course
const rowToCourse = (row: CourseRow, chapters: CourseChapter[] = []): Course => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  icon: row.icon || '📚',
  category: row.category,
  author: row.author,
  estimatedTime: row.estimated_time || '',
  published: row.published,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  chapters,
});

const rowToChapter = (row: ChapterRow, completed = false): CourseChapter => ({
  id: row.id,
  articleId: row.article_id,
  title: row.title,
  order: row.chapter_order,
  completed,
});

// =============================================
// LOCAL STORAGE HELPERS
// =============================================

const getLocalCourses = (): Course[] => {
  const stored = localStorage.getItem(COURSES_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const saveLocalCourses = (courses: Course[]) => {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
};

interface CourseProgress {
  [courseId: string]: {
    [chapterId: string]: boolean;
  };
}

const getLocalProgress = (): CourseProgress => {
  const stored = localStorage.getItem(PROGRESS_KEY);
  if (!stored) return {};
  try {
    return JSON.parse(stored);
  } catch {
    return {};
  }
};

const saveLocalProgress = (progress: CourseProgress) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

// =============================================
// MAIN COURSE SERVICE (Supabase with localStorage fallback)
// =============================================

// Get all courses
export const getCourses = async (): Promise<Course[]> => {
  if (!isSupabaseConfigured) {
    return getLocalCourses();
  }

  const { data: coursesData, error } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching courses:', error);
    return getLocalCourses();
  }

  // Fetch all chapters
  const courseIds = (coursesData || []).map(c => c.id);
  if (courseIds.length === 0) return [];

  const { data: chaptersData } = await supabase
    .from('course_chapters')
    .select('*')
    .in('course_id', courseIds)
    .order('chapter_order', { ascending: true });

  // Group chapters by course
  const chaptersByCourse: Record<string, CourseChapter[]> = {};
  (chaptersData || []).forEach((ch: ChapterRow) => {
    if (!chaptersByCourse[ch.course_id]) {
      chaptersByCourse[ch.course_id] = [];
    }
    chaptersByCourse[ch.course_id].push(rowToChapter(ch));
  });

  return (coursesData || []).map((row: CourseRow) => 
    rowToCourse(row, chaptersByCourse[row.id] || [])
  );
};

// Sync version for backwards compatibility
export const getCoursesSync = (): Course[] => {
  return getLocalCourses();
};

// Get published courses only
export const getPublishedCourses = async (): Promise<Course[]> => {
  if (!isSupabaseConfigured) {
    return getLocalCourses().filter(course => course.published);
  }

  const { data: coursesData, error } = await supabase
    .from('courses')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published courses:', error);
    return getLocalCourses().filter(c => c.published);
  }

  const courseIds = (coursesData || []).map(c => c.id);
  if (courseIds.length === 0) return [];

  const { data: chaptersData } = await supabase
    .from('course_chapters')
    .select('*')
    .in('course_id', courseIds)
    .order('chapter_order', { ascending: true });

  const chaptersByCourse: Record<string, CourseChapter[]> = {};
  (chaptersData || []).forEach((ch: ChapterRow) => {
    if (!chaptersByCourse[ch.course_id]) {
      chaptersByCourse[ch.course_id] = [];
    }
    chaptersByCourse[ch.course_id].push(rowToChapter(ch));
  });

  return (coursesData || []).map((row: CourseRow) => 
    rowToCourse(row, chaptersByCourse[row.id] || [])
  );
};

// Get course by ID
export const getCourseById = async (id: string): Promise<Course | null> => {
  if (!isSupabaseConfigured) {
    const courses = getLocalCourses();
    const course = courses.find(c => c.id === id);
    if (!course) return null;
    
    // Apply local progress
    const progress = getLocalProgress()[id] || {};
    course.chapters = course.chapters.map(ch => ({
      ...ch,
      completed: progress[ch.id] || false,
    }));
    return course;
  }

  const { data: courseData, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !courseData) {
    console.error('Error fetching course:', error);
    // Fallback to local
    const courses = getLocalCourses();
    return courses.find(c => c.id === id) || null;
  }

  // Fetch chapters
  const { data: chaptersData } = await supabase
    .from('course_chapters')
    .select('*')
    .eq('course_id', id)
    .order('chapter_order', { ascending: true });

  // Fetch user progress
  const { data: { user } } = await supabase.auth.getUser();
  let completedChapterIds: string[] = [];
  
  if (user) {
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('chapter_id')
      .eq('course_id', id)
      .eq('user_id', user.id)
      .eq('completed', true);
    
    completedChapterIds = (progressData || []).map(p => p.chapter_id);
  }

  const chapters = (chaptersData || []).map((ch: ChapterRow) => 
    rowToChapter(ch, completedChapterIds.includes(ch.id))
  );

  return rowToCourse(courseData, chapters);
};

// Sync version for backwards compatibility  
export const getCourseByIdSync = (id: string): Course | null => {
  const courses = getLocalCourses();
  return courses.find(c => c.id === id) || null;
};

// Get course containing a specific article
export const getCourseByArticleId = async (articleId: string): Promise<Course | null> => {
  if (!isSupabaseConfigured) {
    const courses = getLocalCourses();
    return courses.find(course => 
      course.chapters.some(chapter => chapter.articleId === articleId)
    ) || null;
  }

  // Find the chapter first
  const { data: chapterData } = await supabase
    .from('course_chapters')
    .select('course_id')
    .eq('article_id', articleId)
    .single();

  if (!chapterData) return null;

  return getCourseById(chapterData.course_id);
};

// Save a new course
export const saveCourse = async (
  course: Omit<Course, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Course> => {
  if (!isSupabaseConfigured) {
    const courses = getLocalCourses();
    const now = new Date().toISOString();
    const newCourse: Course = {
      ...course,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    courses.unshift(newCourse);
    saveLocalCourses(courses);
    return newCourse;
  }

  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('courses')
    .insert({
      title: course.title,
      description: course.description,
      icon: course.icon,
      category: course.category,
      author: course.author,
      estimated_time: course.estimatedTime,
      published: course.published,
      user_id: user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving course:', error);
    throw new Error('Failed to save course');
  }

  // Insert chapters
  if (course.chapters.length > 0) {
    const chaptersToInsert = course.chapters.map((ch, index) => ({
      course_id: data.id,
      article_id: ch.articleId,
      title: ch.title,
      chapter_order: ch.order || index + 1,
    }));

    await supabase.from('course_chapters').insert(chaptersToInsert);
  }

  const savedCourse = rowToCourse(data, course.chapters);

  // Notify subscribers if course is published
  if (course.published) {
    notifySubscribers(
      'course',
      savedCourse.id,
      savedCourse.title,
      savedCourse.description || '',
      `/course/${savedCourse.id}`
    ).catch(err => console.error('Failed to notify subscribers:', err));
  }

  return savedCourse;
};

// Update a course
export const updateCourse = async (
  id: string, 
  updates: Partial<Course>
): Promise<Course | null> => {
  if (!isSupabaseConfigured) {
    const courses = getLocalCourses();
    const index = courses.findIndex(c => c.id === id);
    if (index === -1) return null;
    courses[index] = { ...courses[index], ...updates, updatedAt: new Date().toISOString() };
    saveLocalCourses(courses);
    return courses[index];
  }

  const updateData: Record<string, unknown> = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.icon !== undefined) updateData.icon = updates.icon;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.estimatedTime !== undefined) updateData.estimated_time = updates.estimatedTime;
  if (updates.published !== undefined) updateData.published = updates.published;

  const { data, error } = await supabase
    .from('courses')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating course:', error);
    return null;
  }

  // Update chapters if provided
  if (updates.chapters) {
    await supabase.from('course_chapters').delete().eq('course_id', id);
    
    if (updates.chapters.length > 0) {
      const chaptersToInsert = updates.chapters.map((ch, index) => ({
        course_id: id,
        article_id: ch.articleId,
        title: ch.title,
        chapter_order: ch.order || index + 1,
      }));
      await supabase.from('course_chapters').insert(chaptersToInsert);
    }
  }

  const updatedCourse = data ? rowToCourse(data, updates.chapters || []) : null;

  // Notify subscribers if course is being published
  if (updatedCourse && updates.published === true) {
    notifySubscribers(
      'course',
      updatedCourse.id,
      updatedCourse.title,
      updatedCourse.description || '',
      `/course/${updatedCourse.id}`
    ).catch(err => console.error('Failed to notify subscribers:', err));
  }

  return updatedCourse;
};

// Delete a course
export const deleteCourse = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    const courses = getLocalCourses();
    const filtered = courses.filter(c => c.id !== id);
    if (filtered.length === courses.length) return false;
    saveLocalCourses(filtered);
    return true;
  }

  // First delete associated chapters
  const { error: chaptersError } = await supabase
    .from('course_chapters')
    .delete()
    .eq('course_id', id);
  
  if (chaptersError) {
    console.error('Error deleting course chapters:', chaptersError);
  }

  // Then delete the course
  const { error, data } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error deleting course:', error);
    return false;
  }

  // Check if any rows were deleted (RLS may silently block)
  if (!data || data.length === 0) {
    console.error('No course deleted - permission denied or course not found');
    return false;
  }

  console.log('Course deleted successfully:', data);
  return true;
};

// =============================================
// PROGRESS TRACKING
// =============================================

export const getProgress = (): CourseProgress => {
  return getLocalProgress();
};

export const getCourseProgress = async (courseId: string): Promise<Record<string, boolean>> => {
  if (!isSupabaseConfigured) {
    return getLocalProgress()[courseId] || {};
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const { data } = await supabase
    .from('user_progress')
    .select('chapter_id, completed')
    .eq('course_id', courseId)
    .eq('user_id', user.id);

  const progress: Record<string, boolean> = {};
  (data || []).forEach(p => {
    progress[p.chapter_id] = p.completed;
  });
  return progress;
};

// Sync version for backwards compatibility
export const getCourseProgressSync = (courseId: string): Record<string, boolean> => {
  return getLocalProgress()[courseId] || {};
};

export const markChapterComplete = async (
  courseId: string, 
  chapterId: string
): Promise<void> => {
  if (!isSupabaseConfigured) {
    const progress = getLocalProgress();
    if (!progress[courseId]) progress[courseId] = {};
    progress[courseId][chapterId] = true;
    saveLocalProgress(progress);
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Fallback to local for non-authenticated users
    const progress = getLocalProgress();
    if (!progress[courseId]) progress[courseId] = {};
    progress[courseId][chapterId] = true;
    saveLocalProgress(progress);
    return;
  }

  await supabase
    .from('user_progress')
    .upsert({
      user_id: user.id,
      course_id: courseId,
      chapter_id: chapterId,
      completed: true,
      completed_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,chapter_id',
    });
};

export const markChapterIncomplete = async (
  courseId: string, 
  chapterId: string
): Promise<void> => {
  if (!isSupabaseConfigured) {
    const progress = getLocalProgress();
    if (progress[courseId]) {
      delete progress[courseId][chapterId];
      saveLocalProgress(progress);
    }
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const progress = getLocalProgress();
    if (progress[courseId]) {
      delete progress[courseId][chapterId];
      saveLocalProgress(progress);
    }
    return;
  }

  await supabase
    .from('user_progress')
    .update({ completed: false, completed_at: null })
    .eq('user_id', user.id)
    .eq('chapter_id', chapterId);
};

export const getCourseCompletionPercent = async (course: Course): Promise<number> => {
  if (course.chapters.length === 0) return 0;
  
  const progress = await getCourseProgress(course.id);
  const completedCount = Object.values(progress).filter(Boolean).length;
  return Math.round((completedCount / course.chapters.length) * 100);
};

// Sync version
export const getCourseCompletionPercentSync = (course: Course): number => {
  const progress = getCourseProgressSync(course.id);
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
