import type { Article } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { notifySubscribers } from './subscriberService';

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

// Convert database row to StoredArticle
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

// =============================================
// LOCAL STORAGE FALLBACK (when Supabase unavailable)
// =============================================

const getLocalArticles = (): StoredArticle[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
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

// =============================================
// MAIN ARTICLE SERVICE (Supabase with fallback)
// =============================================

// Get all articles
export const getArticles = async (): Promise<StoredArticle[]> => {
  if (!isSupabaseConfigured) {
    return getLocalArticles();
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching articles:', error);
    return getLocalArticles(); // Fallback to local
  }

  return (data || []).map(rowToArticle);
};

// Get user's own articles (including unpublished)
export const getMyArticles = async (): Promise<StoredArticle[]> => {
  if (!isSupabaseConfigured) {
    return getLocalArticles();
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching my articles:', error);
    return [];
  }

  return (data || []).map(rowToArticle);
};

// Get a single article by ID
export const getArticleById = async (id: string): Promise<StoredArticle | null> => {
  if (!isSupabaseConfigured) {
    const articles = getLocalArticles();
    return articles.find(article => article.id === id) || null;
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    // Fallback to localStorage
    const articles = getLocalArticles();
    return articles.find(article => article.id === id) || null;
  }

  return data ? rowToArticle(data) : null;
};

// Get featured article (most recent featured or first published)
export const getFeaturedArticle = async (): Promise<StoredArticle | null> => {
  if (!isSupabaseConfigured) {
    const articles = getLocalArticles();
    return articles.find(a => a.featured && a.published) || articles.find(a => a.published) || null;
  }

  // First try to get a featured article
  const { data: featured, error: featuredError } = await supabase
    .from('articles')
    .select('*')
    .eq('featured', true)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!featuredError && featured) {
    return rowToArticle(featured);
  }

  // Fallback to most recent published article
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching featured article:', error);
    return null;
  }

  return data ? rowToArticle(data) : null;
};

// Save a new article
export const saveArticle = async (
  article: Omit<StoredArticle, 'id' | 'createdAt' | 'updatedAt'>
): Promise<StoredArticle> => {
  if (!isSupabaseConfigured) {
    return saveLocalArticle(article);
  }

  const { data: { user } } = await supabase.auth.getUser();

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
      user_id: user?.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving article:', error);
    // Fallback to localStorage
    return saveLocalArticle(article);
  }

  const savedArticle = rowToArticle(data);

  // Notify subscribers if article is published
  if (article.published) {
    notifySubscribers(
      'article',
      savedArticle.id,
      savedArticle.title,
      savedArticle.description || '',
      `/article/${savedArticle.id}`
    ).catch(err => console.error('Failed to notify subscribers:', err));
  }

  return savedArticle;
};

// Update an existing article
export const updateArticle = async (
  id: string,
  updates: Partial<StoredArticle>
): Promise<StoredArticle | null> => {
  if (!isSupabaseConfigured) {
    const articles = getLocalArticles();
    const index = articles.findIndex(article => article.id === id);
    if (index === -1) return null;
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
    .select()
    .single();

  if (error) {
    console.error('Error updating article:', error);
    return null;
  }

  const updatedArticle = data ? rowToArticle(data) : null;

  // Notify subscribers if article is being published
  if (updatedArticle && updates.published === true) {
    notifySubscribers(
      'article',
      updatedArticle.id,
      updatedArticle.title,
      updatedArticle.description || '',
      `/article/${updatedArticle.id}`
    ).catch(err => console.error('Failed to notify subscribers:', err));
  }

  return updatedArticle;
};

// Delete an article
export const deleteArticle = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    const articles = getLocalArticles();
    const filtered = articles.filter(article => article.id !== id);
    if (filtered.length === articles.length) return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  const { error, data } = await supabase
    .from('articles')
    .delete()
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error deleting article:', error);
    return false;
  }

  // Check if any rows were deleted (RLS may silently block)
  if (!data || data.length === 0) {
    console.error('No article deleted - permission denied or article not found');
    return false;
  }

  console.log('Article deleted successfully:', data);
  return true;
};

// Get published articles only
export const getPublishedArticles = async (): Promise<StoredArticle[]> => {
  if (!isSupabaseConfigured) {
    return getLocalArticles().filter(article => article.published);
  }

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published articles:', error);
    return [];
  }

  return (data || []).map(rowToArticle);
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Calculate read time
export const calculateReadTime = (content: string): string => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
};
