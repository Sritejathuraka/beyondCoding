import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface Comment {
  id: string;
  articleId: string;
  userId: string;
  content: string;
  edited: boolean;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  // Profile fields
  authorName: string;
  authorEmail: string;
  isAdmin: boolean;
  replies?: Comment[];
}

interface CommentRow {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  edited: boolean;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
}

/**
 * Fetch profiles for a list of user IDs
 */
const fetchProfiles = async (userIds: string[]): Promise<Map<string, ProfileData>> => {
  const profileMap = new Map<string, ProfileData>();
  if (userIds.length === 0) return profileMap;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .in('id', userIds);

  if (error) {
    console.error('Error fetching profiles:', error);
    return profileMap;
  }

  data?.forEach((profile) => {
    profileMap.set(profile.id, profile);
  });

  return profileMap;
};

/**
 * Convert raw comment row + profile to Comment
 */
const rowToComment = (row: CommentRow, profile?: ProfileData): Comment => ({
  id: row.id,
  articleId: row.article_id,
  userId: row.user_id,
  content: row.content,
  edited: row.edited,
  parentId: row.parent_id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  authorName: profile?.full_name || profile?.email?.split('@')[0] || 'Anonymous',
  authorEmail: profile?.email || '',
  isAdmin: profile?.role === 'admin',
});

/**
 * Get all comments for an article (with nested replies)
 */
export const getComments = async (articleId: string): Promise<Comment[]> => {
  if (!isSupabaseConfigured) return [];

  try {
    // Fetch comments without join
    const { data, error } = await supabase
      .from('article_comments')
      .select('*')
      .eq('article_id', articleId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    if (!data || data.length === 0) return [];

    // Get unique user IDs and fetch profiles
    const userIds = [...new Set(data.map((row) => row.user_id))];
    const profileMap = await fetchProfiles(userIds);

    // Convert to comments with profile data
    const comments = data.map((row) => rowToComment(row, profileMap.get(row.user_id)));

    // Organize into parent comments with nested replies
    const topLevel: Comment[] = [];
    const repliesMap: Record<string, Comment[]> = {};

    comments.forEach(comment => {
      if (comment.parentId) {
        if (!repliesMap[comment.parentId]) {
          repliesMap[comment.parentId] = [];
        }
        repliesMap[comment.parentId].push(comment);
      } else {
        topLevel.push(comment);
      }
    });

    // Attach replies to parent comments
    topLevel.forEach(comment => {
      comment.replies = repliesMap[comment.id] || [];
    });

    return topLevel;
  } catch (error) {
    console.error('Error getting comments:', error);
    return [];
  }
};

/**
 * Get comment count for an article
 */
export const getCommentCount = async (articleId: string): Promise<number> => {
  if (!isSupabaseConfigured) return 0;

  try {
    const { count, error } = await supabase
      .from('article_comments')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting comment count:', error);
    return 0;
  }
};

/**
 * Add a new comment
 */
export const addComment = async (
  articleId: string,
  content: string,
  parentId?: string
): Promise<Comment | null> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Must be logged in to comment');
  }

  // Insert the comment
  const { data, error } = await supabase
    .from('article_comments')
    .insert({
      article_id: articleId,
      user_id: user.id,
      content: content.trim(),
      parent_id: parentId || null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error adding comment:', error);
    throw error;
  }

  // Fetch profile for this user
  const profileMap = await fetchProfiles([user.id]);
  return rowToComment(data, profileMap.get(user.id));
};

/**
 * Update a comment (only content, marks as edited)
 */
export const updateComment = async (
  commentId: string,
  content: string
): Promise<Comment | null> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Must be logged in to edit');
  }

  const { data, error } = await supabase
    .from('article_comments')
    .update({
      content: content.trim(),
      edited: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .eq('user_id', user.id)
    .select('*')
    .single();

  if (error) {
    console.error('Error updating comment:', error);
    throw error;
  }

  // Fetch profile for this user
  const profileMap = await fetchProfiles([user.id]);
  return rowToComment(data, profileMap.get(user.id));
};

/**
 * Delete a comment (user's own or admin can delete any)
 */
export const deleteComment = async (commentId: string): Promise<void> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Must be logged in to delete');
  }

  const { error } = await supabase
    .from('article_comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
};

/**
 * Format relative time for comments
 */
export const formatCommentTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};
