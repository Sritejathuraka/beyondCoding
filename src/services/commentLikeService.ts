import { supabase, isSupabaseConfigured } from '../lib/supabase';

/**
 * Get the total like count for a comment
 */
export const getCommentLikeCount = async (commentId: string): Promise<number> => {
  if (!isSupabaseConfigured) return 0;

  try {
    const { count, error } = await supabase
      .from('comment_likes')
      .select('*', { count: 'exact', head: true })
      .eq('comment_id', commentId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting comment like count:', error);
    return 0;
  }
};

/**
 * Check if the current user has liked a comment
 */
export const hasUserLikedComment = async (commentId: string): Promise<boolean> => {
  if (!isSupabaseConfigured) return false;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', commentId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking user comment like:', error);
    return false;
  }
};

/**
 * Toggle like for the current user on a comment
 * Returns { liked: boolean, count: number }
 */
export const toggleCommentLike = async (commentId: string): Promise<{ liked: boolean; count: number }> => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Must be logged in to like');
  }

  // Check if already liked
  const { data: existing } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    // Unlike - delete the like
    const { error } = await supabase
      .from('comment_likes')
      .delete()
      .eq('id', existing.id);

    if (error) throw error;
    
    const count = await getCommentLikeCount(commentId);
    return { liked: false, count };
  } else {
    // Like - insert new like
    const { error } = await supabase
      .from('comment_likes')
      .insert({
        comment_id: commentId,
        user_id: user.id,
      });

    if (error) throw error;
    
    const count = await getCommentLikeCount(commentId);
    return { liked: true, count };
  }
};

/**
 * Get like info for multiple comments at once (batch fetch)
 */
export const getCommentLikesInfo = async (
  commentIds: string[]
): Promise<Map<string, { count: number; liked: boolean }>> => {
  const result = new Map<string, { count: number; liked: boolean }>();
  
  if (!isSupabaseConfigured || commentIds.length === 0) {
    return result;
  }

  try {
    // Get all likes for these comments
    const { data: allLikes, error } = await supabase
      .from('comment_likes')
      .select('comment_id, user_id')
      .in('comment_id', commentIds);

    if (error) throw error;

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Count likes per comment and check if user liked
    const countMap = new Map<string, number>();
    const userLikedMap = new Map<string, boolean>();

    allLikes?.forEach((like) => {
      countMap.set(like.comment_id, (countMap.get(like.comment_id) || 0) + 1);
      if (userId && like.user_id === userId) {
        userLikedMap.set(like.comment_id, true);
      }
    });

    // Build result for all requested comment IDs
    commentIds.forEach((id) => {
      result.set(id, {
        count: countMap.get(id) || 0,
        liked: userLikedMap.get(id) || false,
      });
    });

    return result;
  } catch (error) {
    console.error('Error getting comment likes info:', error);
    return result;
  }
};
