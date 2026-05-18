import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { News as NewsType } from '../../types/news';
import './GetOneNews.css';

export default function GetOneNews() {
  const [news, setNews] = useState<NewsType | null>(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const getNews = async () => {
      try {
        setLoading(true);
// /api/news/getOneNews/
        const res = await axios.get<{ news: NewsType }>(
          `${process.env.REACT_APP_BACKEND_URL}/api/news/getOneNews/${id}`,
          { withCredentials: true }
        );

        setNews(res.data.news);

      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Cannot get news details');
      } finally {
        setLoading(false);
      }
    };

    getNews();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="one-news-page">
        <div className="one-news-header">
          <h1>News Details</h1>
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back
          </button>
        </div>
        <div className="one-news-container">
          <div className="loading">Loading news details...</div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="one-news-page">
        <div className="one-news-header">
          <h1>News Details</h1>
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back
          </button>
        </div>
        <div className="one-news-container">
          <div className="error-message">News not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="one-news-page">
      <div className="one-news-header">
        <h1>News Details</h1>
        <button className="back-btn" onClick={() => navigate('/')}>
          ← Back
        </button>
      </div>

      <div className="one-news-container">
        <div className="one-news-detail">
          {news.is_important && (
            <span className="important-label">Important</span>
          )}

          <div className="one-news-image-container">
            {news.image_url ? (
              <img
                src={news.image_url}
                alt={news.title}
                className="one-news-image"
              />
            ) : (
              <div className="one-news-image-placeholder">
                <span>No Image Available</span>
              </div>
            )}
          </div>

          <div className="one-news-content">
            <h1 className="one-news-title">{news.title}</h1>
            <p className="news-author">By: {news.author?.username}</p>
            <div className="one-news-meta">
              <span className="one-news-date">
                📅 {formatDate(news.createdAt)}
              </span>
            </div>

            <p className="one-news-description">{news.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}