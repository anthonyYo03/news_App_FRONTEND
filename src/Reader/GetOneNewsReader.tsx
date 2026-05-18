import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {useParams, useNavigate } from 'react-router-dom';
import { News as NewsType } from '../types/news';
import Like from '../Like/Like';
import NotificationBell from '../NotificationBell/NotificationBell';
import './GetOneNewsReader.css';
import Share from '../Share/Share';
import Comments from '../Comments/Comments';

export default function GetOneNewsReader() {
  const [news, setNews] = useState<NewsType | null>(null); // single object, not array
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/news/getOneNews/${id}`);
        setNews(response.data.news || null); // single object
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load news');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [id]); // add id as dependency

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="news-page">
      <div className="news-header">
        <h1>Latest News</h1>
        <NotificationBell />
      </div>
      <div className="news-container">
        {loading ? (
          <div className="loading">Loading news...</div>
        ) : !news ? (
          <div className="no-news">No news available</div>
        ) : (
          <div className="news-card">
            {news.is_important && (
              <span className="important-label">Important</span>
            )}

            <div className="news-image-container">
              {news.image_url ? (
                <img
                  src={news.image_url}
                  alt={news.title}
                  className="news-image"
                />
              ) : (
                <div className="news-image-placeholder">
                  <span>No Image</span>
                </div>
              )}
            </div>

            <div className="news-content">
              <h2 className="news-title">{news.title}</h2>
              <p className="news-author">By: {news.author?.username}</p>
              <p className="news-description">{news.description}</p>
              
              <div className="news-meta">
                <span className="news-date">{formatDate(news.createdAt)}</span>
                <div className="news-actions">
                  <Like newsId={news.news_id} />
                    <Comments
                      newsId={news.news_id}
                      newsTitle={news.title}
                      currentUserId={news?.user_id}
                    />
                    <Share
                      newsId={news.news_id}
                      newsTitle={news.title}
                    />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="news-action-buttons">
        <button 
          className="btn btn-primary"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}