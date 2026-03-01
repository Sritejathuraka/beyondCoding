import type { Article } from '../types';

const STORAGE_KEY = 'beyondcode_articles';

export interface StoredArticle extends Article {
  content: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
}

// Get all articles from localStorage
export const getArticles = (): StoredArticle[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

// Get a single article by ID
export const getArticleById = (id: string): StoredArticle | null => {
  const articles = getArticles();
  return articles.find(article => article.id === id) || null;
};

// Save a new article
export const saveArticle = (article: Omit<StoredArticle, 'id' | 'createdAt' | 'updatedAt'>): StoredArticle => {
  const articles = getArticles();
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

// Update an existing article
export const updateArticle = (id: string, updates: Partial<StoredArticle>): StoredArticle | null => {
  const articles = getArticles();
  const index = articles.findIndex(article => article.id === id);
  
  if (index === -1) return null;
  
  articles[index] = {
    ...articles[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  return articles[index];
};

// Delete an article
export const deleteArticle = (id: string): boolean => {
  const articles = getArticles();
  const filtered = articles.filter(article => article.id !== id);
  
  if (filtered.length === articles.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

// Get published articles only
export const getPublishedArticles = (): StoredArticle[] => {
  return getArticles().filter(article => article.published);
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
