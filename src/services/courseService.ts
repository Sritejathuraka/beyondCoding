import type { Course, CourseChapter } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type { Course, CourseChapter };

const COURSES_KEY = 'beyondcode_courses';

// Database row types
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

// ============================================
// HELPERS
// ============================================

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

// ============================================
// LOCAL STORAGE FALLBACK
// ============================================

const getLocalCourses = (): Course[] => {
  try {
    const stored = localStorage.getItem(COURSES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalCourses = (courses: Course[]) => {
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
};

// ============================================
// PUBLIC API
// ============================================

/**
 * Get all published courses
 */
export const getPublishedCourses = async (): Promise<Course[]> => {
  if (!isSupabaseConfigured) {
    return getLocalCourses().filter(c => c.published);
  }

  try {
    // Add timeout to prevent hanging on auth lock
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const { data: coursesData, error } = await supabase
      .from('courses')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .abortSignal(controller.signal);

    if (error) throw error;
    if (!coursesData || coursesData.length === 0) {
      clearTimeout(timeoutId);
      return [];
    }

    // Fetch chapters
    const courseIds = coursesData.map(c => c.id);
    const { data: chaptersData } = await supabase
      .from('course_chapters')
      .select('*')
      .in('course_id', courseIds)
      .order('chapter_order', { ascending: true })
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);

    const chaptersByCourse: Record<string, CourseChapter[]> = {};
    (chaptersData || []).forEach((ch: ChapterRow) => {
      if (!chaptersByCourse[ch.course_id]) {
        chaptersByCourse[ch.course_id] = [];
      }
      chaptersByCourse[ch.course_id].push(rowToChapter(ch));
    });

    return coursesData.map((row: CourseRow) => 
      rowToCourse(row, chaptersByCourse[row.id] || [])
    );
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return [];
  }
};

/**
 * Get all courses (including unpublished for admin)
 */
export const getCourses = async (): Promise<Course[]> => {
  if (!isSupabaseConfigured) {
    return getLocalCourses();
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const { data: coursesData, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false })
      .abortSignal(controller.signal);

    if (error) throw error;
    if (!coursesData || coursesData.length === 0) {
      clearTimeout(timeoutId);
      return [];
    }

    const courseIds = coursesData.map(c => c.id);
    const { data: chaptersData } = await supabase
      .from('course_chapters')
      .select('*')
      .in('course_id', courseIds)
      .order('chapter_order', { ascending: true })
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);

    const chaptersByCourse: Record<string, CourseChapter[]> = {};
    (chaptersData || []).forEach((ch: ChapterRow) => {
      if (!chaptersByCourse[ch.course_id]) {
        chaptersByCourse[ch.course_id] = [];
      }
      chaptersByCourse[ch.course_id].push(rowToChapter(ch));
    });

    return coursesData.map((row: CourseRow) => 
      rowToCourse(row, chaptersByCourse[row.id] || [])
    );
  } catch (error) {
    console.error('Failed to fetch all courses:', error);
    return getLocalCourses();
  }
};

/**
 * Get course by ID
 */
export const getCourseById = async (id: string): Promise<Course | null> => {
  if (!isSupabaseConfigured) {
    return getLocalCourses().find(c => c.id === id) || null;
  }

  try {
    const { data: courseData, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!courseData) return null;

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
  } catch (error) {
    console.error('Failed to fetch course:', error);
    return null;
  }
};

/**
 * Save a new course
 * @throws Error if save fails
 */
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
  if (!user) {
    throw new Error('You must be logged in to create courses');
  }

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
      user_id: user.id,
    })
    .select();

  if (error) {
    console.error('Save course error:', error);
    throw new Error(error.message || 'Failed to save course');
  }

  if (!data || data.length === 0) {
    throw new Error('Failed to save course - no data returned');
  }

  const courseData = data[0];

  // Insert chapters
  if (course.chapters && course.chapters.length > 0) {
    const chaptersToInsert = course.chapters.map((ch, index) => ({
      course_id: courseData.id,
      article_id: ch.articleId,
      title: ch.title,
      chapter_order: ch.order || index + 1,
    }));
    await supabase.from('course_chapters').insert(chaptersToInsert);
  }

  return rowToCourse(courseData, course.chapters || []);
};

/**
 * Update an existing course
 * @throws Error if update fails
 */
export const updateCourse = async (
  id: string, 
  updates: Partial<Course>
): Promise<Course> => {
  if (!isSupabaseConfigured) {
    const courses = getLocalCourses();
    const index = courses.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Course not found');
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
    .select();

  if (error) {
    console.error('Update course error:', error);
    throw new Error(error.message || 'Failed to update course');
  }

  if (!data || data.length === 0) {
    throw new Error('Course not found or you do not have permission');
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

  return rowToCourse(data[0], updates.chapters || []);
};

/**
 * Delete a course
 * @throws Error if delete fails
 */
export const deleteCourse = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    const courses = getLocalCourses();
    const filtered = courses.filter(c => c.id !== id);
    if (filtered.length === courses.length) {
      throw new Error('Course not found');
    }
    saveLocalCourses(filtered);
    return;
  }

  // Delete chapters first
  await supabase.from('course_chapters').delete().eq('course_id', id);

  const { error, data } = await supabase
    .from('courses')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('Delete course error:', error);
    throw new Error(error.message || 'Failed to delete course');
  }

  if (!data || data.length === 0) {
    throw new Error('Course not found or you do not have permission');
  }
};

/**
 * Mark a chapter as completed
 */
export const markChapterComplete = async (
  courseId: string, 
  chapterId: string
): Promise<void> => {
  if (!isSupabaseConfigured) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('user_progress').upsert({
    user_id: user.id,
    course_id: courseId,
    chapter_id: chapterId,
    completed: true,
    completed_at: new Date().toISOString(),
  });
};

/**
 * Get chapter completion status for current user (map of chapterId -> completed)
 */
export const getChapterProgress = async (courseId: string): Promise<Record<string, boolean>> => {
  if (!isSupabaseConfigured) return {};

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return {};

    const { data: completed } = await supabase
      .from('user_progress')
      .select('chapter_id')
      .eq('course_id', courseId)
      .eq('user_id', user.id)
      .eq('completed', true);

    const progressMap: Record<string, boolean> = {};
    (completed || []).forEach(item => {
      progressMap[item.chapter_id] = true;
    });
    return progressMap;
  } catch {
    return {};
  }
};

/**
 * Get course progress percentage for current user
 */
export const getCourseProgress = async (courseId: string): Promise<number> => {
  if (!isSupabaseConfigured) return 0;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data: chapters } = await supabase
      .from('course_chapters')
      .select('id')
      .eq('course_id', courseId);

    if (!chapters || chapters.length === 0) return 0;

    const { data: completed } = await supabase
      .from('user_progress')
      .select('chapter_id')
      .eq('course_id', courseId)
      .eq('user_id', user.id)
      .eq('completed', true);

    return Math.round(((completed?.length || 0) / chapters.length) * 100);
  } catch {
    return 0;
  }
};
