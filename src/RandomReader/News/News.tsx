import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link,useNavigate } from 'react-router-dom';
import { News as NewsType } from '../../types/news';
import './News.css';
import GetLastFiveImportantNews from './GetLastFiveImportantNews';

export default function News() {
  const [news, setNews] = useState<NewsType[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/news/all`);
        setNews(response.data.news || []);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load news');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

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
        <Link to="/login" className="login-btn">
          Login
        </Link>
      </div>
        <GetLastFiveImportantNews />
      <div className="news-container">
        {loading ? (
          <div className="loading">Loading news...</div>
        ) : news.length === 0 ? (
          <div className="no-news">No news available</div>
        ) : (
          <div className="news-grid" >
            {news.map((newsItem) => (
              <div key={newsItem.news_id} className="news-card" style={{cursor:'pointer'}} onClick={()=>{navigate(`/oneNews/${newsItem.news_id}`)}}>
                {newsItem.is_important && (
                  <span className="important-label">Important</span>
                )}
                
                <div className="news-image-container">
                  {newsItem.image_url ? (
                    <img 
                      src={newsItem.image_url} 
                      alt={newsItem.title}
                      className="news-image"
                    />
                  ) : (
                    <div className="news-image-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                </div>

                <div className="news-content">
                  <h2 className="news-title">{newsItem.title}</h2>
                  <p className="news-author">By: {newsItem.author?.username}</p>
                  <p className="news-description">{newsItem.description}</p>
                  <div className="news-meta">
                    <span className="news-date">
                      {formatDate(newsItem.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
