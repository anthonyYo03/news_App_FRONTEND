import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { News as NewsType } from '../types/news';
import { handleLogout } from '../Logout/Logout';
import '../RandomReader/News/News.css';
import './JournalistDashboard.css';
import GetLastFiveImportantNewsForJournalist from '../RandomReader/News/GetLastFiveImportantNewsForJournalist';
import NotificationBell from '../NotificationBell/NotificationBell';
import Like from '../Like/Like';
import Comments from '../Comments/Comments';
import Share from '../Share/Share';




export default function JournalistDashboard() {
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
        <div className="header-actions">
          <NotificationBell/>
          <button className="logout-btn" onClick={() => handleLogout(navigate)}>Logout</button>
        </div>
      </div>
        <GetLastFiveImportantNewsForJournalist />
      <div className="news-container">
        {loading ? (
          <div className="loading">Loading news...</div>
        ) : news.length === 0 ? (
          <div className="no-news">No news available</div>
        ) : (
          <div className="news-grid" >
            {news.map((newsItem) => (
              <div key={newsItem.news_id} className="news-card" style={{cursor:'pointer'}} onClick={()=>{navigate(`/journalistNews/${newsItem.news_id}`)}}>
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


                    <div className="news-actions" onClick={(e) => e.stopPropagation()}>
  <Like newsId={newsItem.news_id} />
  <Comments
    newsId={newsItem.news_id}
    newsTitle={newsItem.title}
    currentUserId={newsItem?.user_id}
  />
  <Share
    newsId={newsItem.news_id}
    newsTitle={newsItem.title}
  />
</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button 
        className="create-news-fab"
        onClick={() => navigate('/createNews')}
        title="Create a new article"
      >
        +
      </button>
    </div>
  );
}
