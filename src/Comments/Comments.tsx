import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiMessageCircle, FiSend, FiX, FiTrash2, FiEdit2, FiCheck } from 'react-icons/fi';
import './Comments.css';

interface CommentUser {
  user_id: number;
  username: string;
  email: string;
}

interface Comment {
  comment_id: number;
  message: string;
  user_id: number;
  news_id: number;
  createdAt: string;
  updatedAt: string;
  User: CommentUser;
}

interface CommentsProps {
  newsId: number;
  newsTitle?: string;
  currentUserId?: number; // pass the logged-in user's ID from your auth context
}

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

// Helper: format date nicely
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

// Avatar initials helper
const getInitials = (username: string) =>
  username ? username.slice(0, 2).toUpperCase() : '??';

// Deterministic pastel color per username
const avatarColor = (username: string) => {
  const colors = [
    '#FF6B6B', '#FF9F43', '#FECA57', '#48DBFB',
    '#1DD1A1', '#A29BFE', '#FD79A8', '#6C5CE7',
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function Comments({ newsId, newsTitle, currentUserId }: CommentsProps) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMessage, setEditMessage] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const LIMIT = 15;

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const fetchCommentCount = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/api/comment/newsComments/${newsId}?limit=1&offset=0`, {
        withCredentials: true,
      });
      setTotalComments(res.data.totalComments);
    } catch (_) {}
  }, [newsId]);

  const fetchComments = useCallback(async (offsetVal: number, reset = false) => {
    try {
      setFetching(true);
      const res = await axios.get(
        `${API}/api/comment/newsComments/${newsId}?limit=${LIMIT}&offset=${offsetVal}`,
        { withCredentials: true }
      );
      const fetched: Comment[] = res.data.comments;
      const total: number = res.data.totalComments;
      setTotalComments(total);
      setComments(prev => reset ? fetched : [...prev, ...fetched]);
      setHasMore(offsetVal + LIMIT < total);
      setOffset(offsetVal + LIMIT);
    } catch (err) {
      toast.error('Failed to load comments');
    } finally {
      setFetching(false);
    }
  }, [newsId]);

  // Fetch comment count on mount (for the badge)
  useEffect(() => {
    fetchCommentCount();
  }, [fetchCommentCount]);

  // Fetch comments when modal opens
  useEffect(() => {
    if (open) {
      setComments([]);
      setOffset(0);
      fetchComments(0, true);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, fetchComments]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSubmit = async () => {
    if (!message.trim() || loading) return;
    setLoading(true);
    try {
      await axios.post(
        `${API}/api/comment/createNewsComment/${newsId}`,
        { message: message.trim() },
        { withCredentials: true }
      );
      setMessage('');
      // Re-fetch from top to get new comment
      setComments([]);
      setOffset(0);
      await fetchComments(0, true);
      toast.success('Comment posted!');
      // Scroll to top of list to see new comment
      if (listRef.current) listRef.current.scrollTop = 0;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await axios.delete(`${API}/api/comment/deleteNewsComment/${commentId}`, {
        withCredentials: true,
      });
      setComments(prev => prev.filter(c => c.comment_id !== commentId));
      setTotalComments(prev => prev - 1);
      toast.success('Comment deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.comment_id);
    setEditMessage(comment.message);
  };

  const submitEdit = async (commentId: number) => {
    if (!editMessage.trim()) return;
    try {
      await axios.put(
        `${API}/api/comment/updateNewsComment/${commentId}`,
        { message: editMessage.trim() },
        { withCredentials: true }
      );
      setComments(prev =>
        prev.map(c =>
          c.comment_id === commentId ? { ...c, message: editMessage.trim() } : c
        )
      );
      setEditingId(null);
      toast.success('Comment updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update comment');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Trigger button — sits next to Like */}
      <div className="comment-trigger" onClick={() => setOpen(true)}>
        <button className="comment-trigger-btn" aria-label="Open comments">
          <FiMessageCircle size={22} />
        </button>
        <span className="comment-trigger-count">
          {totalComments === 0 ? 'No comments' : `${totalComments} ${totalComments === 1 ? 'comment' : 'comments'}`}
        </span>
      </div>

      {/* Backdrop + Modal */}
      {open && (
        <div className="comment-overlay" onClick={() => setOpen(false)}>
          <div className="comment-modal" onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="comment-modal-header">
              <div className="comment-modal-title">
                <FiMessageCircle size={18} />
                <span>Comments</span>
                {totalComments > 0 && (
                  <span className="comment-modal-badge">{totalComments}</span>
                )}
              </div>
              {newsTitle && <p className="comment-modal-subtitle">{newsTitle}</p>}
              <button className="comment-close-btn" onClick={() => setOpen(false)}>
                <FiX size={20} />
              </button>
            </div>

            {/* Comment List */}
            <div className="comment-list" ref={listRef}>
              {fetching && comments.length === 0 ? (
                <div className="comment-empty">
                  <div className="comment-skeleton" />
                  <div className="comment-skeleton short" />
                  <div className="comment-skeleton" />
                </div>
              ) : comments.length === 0 ? (
                <div className="comment-empty">
                  <FiMessageCircle size={40} opacity={0.2} />
                  <p>No comments yet.<br />Be the first to share your thoughts.</p>
                </div>
              ) : (
                <>
                  {comments.map(comment => (
                    <div key={comment.comment_id} className="comment-item">
                      {/* Avatar */}
                      <div
                        className="comment-avatar"
                        style={{ background: avatarColor(comment.User?.username || '') }}
                      >
                        {getInitials(comment.User?.username || '?')}
                      </div>

                      {/* Body */}
                      <div className="comment-body">
                        <div className="comment-meta">
                          <span className="comment-username">{comment.User?.username}</span>
                          <span className="comment-time">{formatDate(comment.createdAt)}</span>
                        </div>

                        {editingId === comment.comment_id ? (
                          <div className="comment-edit-area">
                            <textarea
                              className="comment-edit-input"
                              value={editMessage}
                              onChange={e => setEditMessage(e.target.value)}
                              autoFocus
                            />
                            <div className="comment-edit-actions">
                              <button className="comment-edit-save" onClick={() => submitEdit(comment.comment_id)}>
                                <FiCheck size={14} /> Save
                              </button>
                              <button className="comment-edit-cancel" onClick={() => setEditingId(null)}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="comment-text">{comment.message}</p>
                        )}
                      </div>

                      {/* Actions (only for comment owner) */}
                      {currentUserId === comment.user_id && editingId !== comment.comment_id && (
                        <div className="comment-actions">
                          <button className="comment-action-btn edit" onClick={() => startEdit(comment)} title="Edit">
                            <FiEdit2 size={13} />
                          </button>
                          <button className="comment-action-btn delete" onClick={() => handleDelete(comment.comment_id)} title="Delete">
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {hasMore && (
                    <button
                      className="comment-load-more"
                      onClick={() => fetchComments(offset)}
                      disabled={fetching}
                    >
                      {fetching ? 'Loading…' : 'Load more comments'}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Input */}
            <div className="comment-input-area">
              <textarea
                ref={inputRef}
                className="comment-input"
                placeholder="Write a comment… (Enter to send)"
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                maxLength={1000}
              />
              <button
                className={`comment-send-btn ${message.trim() && !loading ? 'active' : ''}`}
                onClick={handleSubmit}
                disabled={!message.trim() || loading}
              >
                <FiSend size={18} />
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}