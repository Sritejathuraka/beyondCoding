import type { Article } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_KEY = 'beyondcode_articles';

export interface StoredArticle extends Article {
  content: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  userId?: string;
}

// Database row type (snake_case from Supabase)
interface ArticleRow {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  category: string;
  author: string;
  read_time: string | null;
  featured: boolean;
  published: boolean;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// HELPERS
// ============================================

const rowToArticle = (row: ArticleRow): StoredArticle => ({
  id: row.id,
  title: row.title,
  description: row.description || '',
  content: row.content || '',
  category: row.category,
  author: row.author,
  readTime: row.read_time || '',
  date: new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  featured: row.featured,
  published: row.published,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  userId: row.user_id || undefined,
});

// ============================================
// LOCAL STORAGE FALLBACK
// ============================================

const getLocalArticles = (): StoredArticle[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalArticle = (article: Omit<StoredArticle, 'id' | 'createdAt' | 'updatedAt'>): StoredArticle => {
  const articles = getLocalArticles();
  const now = new Date().toISOString();
  const newArticle: StoredArticle = {
    ...article,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  articles.unshift(newArticle);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  return newArticle;
};

// ============================================
// PUBLIC API
// ============================================

/**
 * Get all published articles
 */
export const getPublishedArticles = async (): Promise<StoredArticle[]> => {
  if (!isSupabaseConfigured) {
    return getLocalArticles().filter(a => a.published);
  }

  try {
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);

    if (error) throw error;
    return (data || []).map(rowToArticle);
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
};

/**
 * Get featured article for homepage
 */
export const getFeaturedArticle = async (): Promise<StoredArticle | null> => {
  if (!isSupabaseConfigured) {
    const articles = getLocalArticles();
    return articles.find(a => a.featured && a.published) || articles.find(a => a.published) || null;
  }

  try {
    // Add timeout to prevent hanging on auth lock
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    // Try featured first
    const { data: featured } = await supabase
      .from('articles')
      .select('*')
      .eq('featured', true)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .abortSignal(controller.signal);

    if (featured && featured.length > 0) {
      clearTimeout(timeoutId);
      return rowToArticle(featured[0]);
    }

    // Fallback to most recent
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .abortSignal(controller.signal);
    
    clearTimeout(timeoutId);

    return data && data.length > 0 ? rowToArticle(data[0]) : null;
  } catch (error) {
    console.error('Failed to fetch featured article:', error);
    return null;
  }
};

/**
 * Get article by ID
 */
export const getArticleById = async (id: string): Promise<StoredArticle | null> => {
  if (!isSupabaseConfigured) {
    return getLocalArticles().find(a => a.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? rowToArticle(data) : null;
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
};

/**
 * Get current user's articles (including drafts)
 */
export const getMyArticles = async (): Promise<StoredArticle[]> => {
  if (!isSupabaseConfigured) {
    return getLocalArticles();
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(rowToArticle);
  } catch (error) {
    console.error('Failed to fetch my articles:', error);
    return [];
  }
};

/**
 * Save a new article
 * @throws Error if save fails
 */
export const saveArticle = async (
  article: Omit<StoredArticle, 'id' | 'createdAt' | 'updatedAt'>
): Promise<StoredArticle> => {
  if (!isSupabaseConfigured) {
    return saveLocalArticle(article);
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('You must be logged in to save articles');
  }

  const { data, error } = await supabase
    .from('articles')
    .insert({
      title: article.title,
      description: article.description,
      content: article.content,
      category: article.category,
      author: article.author,
      read_time: article.readTime,
      featured: article.featured || false,
      published: article.published,
      user_id: user.id,
    })
    .select();

  if (error) {
    console.error('Save article error:', error);
    throw new Error(error.message || 'Failed to save article');
  }

  if (!data || data.length === 0) {
    throw new Error('Failed to save article - no data returned');
  }

  return rowToArticle(data[0]);
};

/**
 * Update an existing article
 * @throws Error if update fails
 */
export const updateArticle = async (
  id: string,
  updates: Partial<StoredArticle>
): Promise<StoredArticle> => {
  if (!isSupabaseConfigured) {
    const articles = getLocalArticles();
    const index = articles.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Article not found');
    articles[index] = { ...articles[index], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    return articles[index];
  }

  const updateData: Record<string, unknown> = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.content !== undefined) updateData.content = updates.content;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.author !== undefined) updateData.author = updates.author;
  if (updates.readTime !== undefined) updateData.read_time = updates.readTime;
  if (updates.featured !== undefined) updateData.featured = updates.featured;
  if (updates.published !== undefined) updateData.published = updates.published;

  const { data, error } = await supabase
    .from('articles')
    .update(updateData)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Update article error:', error);
    throw new Error(error.message || 'Failed to update article');
  }

  if (!data || data.length === 0) {
    throw new Error('Article not found or you do not have permission');
  }

  return rowToArticle(data[0]);
};

/**
 * Delete an article
 * @throws Error if delete fails
 */
export const deleteArticle = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    const articles = getLocalArticles();
    const filtered = articles.filter(a => a.id !== id);
    if (filtered.length === articles.length) {
      throw new Error('Article not found');
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return;
  }

  const { error, data } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('Delete article error:', error);
    throw new Error(error.message || 'Failed to delete article');
  }

  if (!data || data.length === 0) {
    throw new Error('Article not found or you do not have permission');
  }
};

// ============================================
// UTILITIES
// ============================================

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

export const calculateReadTime = (content: string): string => {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
};
