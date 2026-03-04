import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface ArticleLike {
  id: string;
  articleId: string;
  userId: string;
  createdAt: string;
}

/**
 * Get the total like count for an article
 */
export const getLikeCount = async (articleId: string): Promise<number> => {
  if (!isSupabaseConfigured) return 0;

  try {
    const { count, error } = await supabase
      .from('article_likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting like count:', error);
    return 0;
  }
};

/**
 * Check if the current user has liked an article
 */
export const hasUserLiked = async (articleId: string): Promise<boolean> => {
  if (!isSupabaseConfigured) return false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('article_likes')
      .select('id')
      .eq('article_id', articleId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking user like:', error);
    return false;
  }
};

/**
 * Toggle like for the current user on an article
 * Returns { liked: boolean, count: number }
 */
export const toggleLike = async (articleId: string): Promise<{ liked: boolean; count: number }> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Must be logged in to like');
  }

  // Check if already liked
  const { data: existing } = await supabase
    .from('article_likes')
    .select('id')
    .eq('article_id', articleId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    // Unlike - delete the like
    const { error } = await supabase
      .from('article_likes')
      .delete()
      .eq('id', existing.id);

    if (error) throw error;
    
    const count = await getLikeCount(articleId);
    return { liked: false, count };
  } else {
    // Like - insert new like
    const { error } = await supabase
      .from('article_likes')
      .insert({
        article_id: articleId,
        user_id: user.id,
      });

    if (error) throw error;
    
    const count = await getLikeCount(articleId);
    return { liked: true, count };
  }
};

/**
 * Get like count and user liked status together (efficient single call)
 */
export const getLikeInfo = async (articleId: string): Promise<{ count: number; liked: boolean }> => {
  if (!isSupabaseConfigured) {
    return { count: 0, liked: false };
  }

  try {
    const [count, liked] = await Promise.all([
      getLikeCount(articleId),
      hasUserLiked(articleId),
    ]);

    return { count, liked };
  } catch (error) {
    console.error('Error getting like info:', error);
    return { count: 0, liked: false };
  }
};
