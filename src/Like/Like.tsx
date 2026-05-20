import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import './Like.css';

interface LikeProps {
  newsId: number;
  onLikeChange?: (likeCount: number, isLiked: boolean) => void;
}

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export default function Like({ newsId, onLikeChange }: LikeProps) {
  const [likeCount, setLikeCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);

  // Fetch like data on component mount
  const fetchLikeData = useCallback(async () => {
    try {
      setFetching(true);
      const response = await axios.get(`${API}/api/like/news/${newsId}`, {
        withCredentials: true,
      });
      setLikeCount(response.data.totalLikes);
      
      // ✅ Use the dedicated field from backend, not the total list length
      setIsLiked(response.data.userHasLiked);
    } catch (err: any) {
      console.error('Error fetching likes:', err);
    } finally {
      setFetching(false);
    }
  }, [newsId]);

  useEffect(() => {
    fetchLikeData();
  }, [fetchLikeData]);

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (loading) return;

    setLoading(true);
    try {
      if (isLiked) {
        // Remove like
        const response = await axios.delete(
          `${API}/api/like/removeLike/${newsId}`,
          { withCredentials: true }
        );
        setLikeCount(response.data.totalLikes);
        setIsLiked(false);
        toast.success('Like removed');
      } else {
        // Add like
        const response = await axios.post(
          `${API}/api/like/addLike/${newsId}`,
          {},
          { withCredentials: true }
        );
        setLikeCount(response.data.totalLikes);
        setIsLiked(true);
        toast.success('Post liked!');
      }
      
      // Notify parent component of change
      if (onLikeChange) {
        onLikeChange(likeCount, !isLiked);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to update like';
      toast.error(errorMsg);
      console.error('Error updating like:', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="like-container">
        <span className="like-loading">Loading...</span>
      </div>
    );
  }

  return (
    <div className="like-container">
      <button
        className={`like-btn ${isLiked ? 'liked' : ''} ${loading ? 'disabled' : ''}`}
        onClick={handleLikeToggle}
        disabled={loading}
        aria-label={isLiked ? 'Unlike post' : 'Like post'}
        title={isLiked ? 'Unlike' : 'Like'}
      >
        {isLiked ? (
          <AiFillHeart size={24} />
        ) : (
          <AiOutlineHeart size={24} />
        )}
      </button>
      <span className="like-count">
        {likeCount === 0 ? 'No likes' : `${likeCount} ${likeCount === 1 ? 'like' : 'likes'}`}
      </span>
    </div>
  );
}
