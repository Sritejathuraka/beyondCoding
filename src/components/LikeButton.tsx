import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getLikeInfo, toggleLike } from '../services/likeService';
import { useToast } from '../contexts/ToastContext';

interface LikeButtonProps {
  articleId: string;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const LikeButton = ({ articleId, showCount = true, size = 'md' }: LikeButtonProps) => {
  const { user } = useAuth();
  const toast = useToast();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const loadLikeInfo = async () => {
      const info = await getLikeInfo(articleId);
      setLiked(info.liked);
      setCount(info.count);
      setLoading(false);
    };
    loadLikeInfo();
  }, [articleId]);

  const handleClick = async () => {
    if (!user) {
      toast.info('Sign in to like this article');
      return;
    }

    // Optimistic update
    const wasLiked = liked;
    const prevCount = count;
    setLiked(!liked);
    setCount(liked ? count - 1 : count + 1);
    setAnimating(true);

    try {
      const result = await toggleLike(articleId);
      setLiked(result.liked);
      setCount(result.count);
    } catch (error) {
      // Revert on error
      setLiked(wasLiked);
      setCount(prevCount);
      toast.error('Failed to update like');
    } finally {
      setTimeout(() => setAnimating(false), 300);
    }
  };

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const buttonSizeClasses = {
    sm: 'gap-1 text-sm',
    md: 'gap-1.5 text-base',
    lg: 'gap-2 text-lg',
  };

  if (loading) {
    return (
      <div className={`flex items-center ${buttonSizeClasses[size]} text-[var(--color-text-muted)]`}>
        <div className={`${sizeClasses[size]} rounded-full bg-[var(--color-border)] animate-pulse`} />
        {showCount && <span>—</span>}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center ${buttonSizeClasses[size]} transition-all duration-200 group ${
        liked 
          ? 'text-red-500' 
          : 'text-[var(--color-text-muted)] hover:text-red-500'
      }`}
      aria-label={liked ? 'Unlike article' : 'Like article'}
    >
      <svg
        className={`${sizeClasses[size]} transition-transform ${
          animating ? 'scale-125' : 'scale-100'
        } ${liked ? 'fill-red-500' : 'fill-none group-hover:fill-red-500/20'}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {showCount && (
        <span className="font-medium tabular-nums">
          {count > 0 ? count : ''}
        </span>
      )}
    </button>
  );
};

export default LikeButton;
