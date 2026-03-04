import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  formatCommentTime,
  type Comment,
} from '../services/commentService';
import { toggleCommentLike, getCommentLikesInfo } from '../services/commentLikeService';

interface CommentSectionProps {
  articleId: string;
}

// Single Comment Component
const CommentItem = ({
  comment,
  articleId,
  onUpdate,
  onDelete,
  onReply,
  getLikeInfo,
  onLikeToggle,
  depth = 0,
}: {
  comment: Comment;
  articleId: string;
  onUpdate: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  onReply: (parentId: string, content: string) => Promise<void>;
  getLikeInfo: (commentId: string) => { count: number; liked: boolean };
  onLikeToggle: (commentId: string) => Promise<void>;
  depth?: number;
}) => {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [liking, setLiking] = useState(false);

  const likeInfo = getLikeInfo(comment.id);

  const handleLike = async () => {
    if (!user) {
      toast.info('Sign in to like comments');
      return;
    }
    setLiking(true);
    try {
      await onLikeToggle(comment.id);
    } catch {
      toast.error('Failed to update like');
    } finally {
      setLiking(false);
    }
  };

  const isOwner = user?.id === comment.userId;
  const canEdit = isOwner;
  const canDelete = isOwner || isAdmin;
  const canReply = isAdmin && depth === 0; // Only admin can reply to top-level comments

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    setLoading(true);
    try {
      const updated = await updateComment(comment.id, editContent);
      if (updated) {
        onUpdate(updated);
        setIsEditing(false);
        toast.success('Comment updated');
      }
    } catch {
      toast.error('Failed to update comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this comment?')) return;
    setLoading(true);
    try {
      await deleteComment(comment.id);
      onDelete(comment.id);
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setLoading(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    } catch {
      toast.error('Failed to add reply');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-[var(--color-border)] pl-4' : ''}`}>
      <div className="py-4">
        {/* Comment Header */}
        <div className="flex items-center gap-2 mb-2">
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            comment.isAdmin 
              ? 'bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white' 
              : 'bg-[var(--color-surface)] text-[var(--color-text-muted)]'
          }`}>
            {comment.authorName.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-[var(--color-text)]">
              {comment.authorName}
            </span>
            {comment.isAdmin && (
              <span className="px-1.5 py-0.5 text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded">
                Admin
              </span>
            )}
            <span className="text-sm text-[var(--color-text-muted)]">
              {formatCommentTime(comment.createdAt)}
            </span>
            {comment.edited && (
              <span className="text-xs text-[var(--color-text-muted)] italic">
                (edited)
              </span>
            )}
          </div>
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                disabled={loading || !editContent.trim()}
                className="px-3 py-1.5 text-sm font-medium bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary)]/90 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className="px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-[var(--color-text)] whitespace-pre-wrap">
            {comment.content}
          </p>
        )}

        {/* Comment Actions */}
        {!isEditing && (
          <div className="flex items-center gap-4 mt-2">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                likeInfo.liked
                  ? 'text-red-500'
                  : 'text-[var(--color-text-muted)] hover:text-red-500'
              }`}
            >
              <svg
                className={`w-4 h-4 ${likeInfo.liked ? 'fill-current' : ''}`}
                fill={likeInfo.liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {likeInfo.count > 0 && <span>{likeInfo.count}</span>}
            </button>
            {canReply && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
              >
                Reply
              </button>
            )}
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={loading}
                className="text-sm text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        )}

        {/* Reply Form (Admin only) */}
        {isReplying && (
          <div className="mt-3 space-y-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
              rows={2}
            />
            <div className="flex gap-2">
              <button
                onClick={handleReply}
                disabled={loading || !replyContent.trim()}
                className="px-3 py-1.5 text-sm font-medium bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary)]/90 disabled:opacity-50"
              >
                {loading ? 'Replying...' : 'Reply'}
              </button>
              <button
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
                className="px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              articleId={articleId}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onReply={onReply}
              getLikeInfo={getLikeInfo}
              onLikeToggle={onLikeToggle}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main Comment Section
const CommentSection = ({ articleId }: CommentSectionProps) => {
  const { user } = useAuth();
  const toast = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [likesMap, setLikesMap] = useState<Map<string, { count: number; liked: boolean }>>(new Map());

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    setLoading(true);
    const data = await getComments(articleId);
    setComments(data);
    
    // Get all comment IDs including replies
    const allIds: string[] = [];
    data.forEach(c => {
      allIds.push(c.id);
      c.replies?.forEach(r => allIds.push(r.id));
    });
    
    // Fetch likes info for all comments
    if (allIds.length > 0) {
      const likesInfo = await getCommentLikesInfo(allIds);
      setLikesMap(likesInfo);
    }
    
    setLoading(false);
  };

  const handleLikeToggle = async (commentId: string) => {
    const result = await toggleCommentLike(commentId);
    setLikesMap(prev => {
      const newMap = new Map(prev);
      newMap.set(commentId, { count: result.count, liked: result.liked });
      return newMap;
    });
  };

  const getLikeInfo = (commentId: string) => {
    return likesMap.get(commentId) || { count: 0, liked: false };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const comment = await addComment(articleId, newComment);
      if (comment) {
        setComments([...comments, { ...comment, replies: [] }]);
        setNewComment('');
        toast.success('Comment added');
      }
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    const reply = await addComment(articleId, content, parentId);
    if (reply) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), reply] }
            : c
        )
      );
      toast.success('Reply added');
    }
  };

  const handleUpdate = (updatedComment: Comment) => {
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === updatedComment.id) {
          return { ...updatedComment, replies: c.replies };
        }
        // Check replies
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === updatedComment.id ? updatedComment : r
            ),
          };
        }
        return c;
      })
    );
  };

  const handleDelete = (commentId: string) => {
    setComments((prev) =>
      prev
        .filter((c) => c.id !== commentId)
        .map((c) => ({
          ...c,
          replies: c.replies?.filter((r) => r.id !== commentId),
        }))
    );
  };

  const totalCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0
  );

  return (
    <div className="mt-12 pt-8 border-t border-[var(--color-border)]">
      {/* Header */}
      <h3 className="text-xl font-bold text-[var(--color-text)] mb-6">
        Comments {totalCount > 0 && `(${totalCount})`}
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            className="w-full px-4 py-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none transition-all"
            rows={3}
          />
          <div className="flex justify-end mt-3">
            <button
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="px-5 py-2.5 font-medium bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center">
          <p className="text-[var(--color-text-muted)] mb-3">
            Sign in to join the conversation
          </p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 font-medium bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary)]/90 transition-all"
          >
            Sign In
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[var(--color-surface)]" />
                <div className="h-4 w-24 bg-[var(--color-surface)] rounded" />
              </div>
              <div className="h-16 bg-[var(--color-surface)] rounded" />
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="divide-y divide-[var(--color-border)]">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              articleId={articleId}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onReply={handleReply}
              getLikeInfo={getLikeInfo}
              onLikeToggle={handleLikeToggle}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-[var(--color-text-muted)]">
            No comments yet. Be the first to share your thoughts!
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
