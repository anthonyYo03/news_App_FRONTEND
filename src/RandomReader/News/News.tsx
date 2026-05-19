import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link,useNavigate } from 'react-router-dom';
import { News as NewsType } from '../../types/news';
import './News.css';
import GetLastFiveImportantNews from './GetLastFiveImportantNews';

export default function News() {
  const [news, setNews] = useState<NewsType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalNews, setTotalNews] = useState(0);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  const newsTypes = ['all', 'local', 'politics', 'sports', 'entertainment', 'international', 'economy'];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const offset = currentPage * itemsPerPage;
        let url = `${process.env.REACT_APP_BACKEND_URL}/api/news/all?limit=${itemsPerPage}&offset=${offset}`;
        
        // Add type filter if selected type is not 'all'
        if (selectedType !== 'all') {
          url += `&news_type_id=${selectedType}`;
        }
        
        const response = await axios.get(url);
        setNews(response.data.news || []);
        setTotalNews(response.data.totalNews || 0);
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load news');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedType, currentPage]);

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
      <div className="filter-section">
        <label htmlFor="newsTypeFilter">Filter by Type: </label>
        <select 
          id="newsTypeFilter"
          value={selectedType} 
          onChange={(e) => {
            setSelectedType(e.target.value);
            setCurrentPage(0);
          }}
          className="news-type-dropdown"
        >
          <option value="all">All News</option>
          <option value="1">Local</option>
          <option value="2">Politics</option>
          <option value="3">Sports</option>
          <option value="4">Entertainment</option>
          <option value="5">International</option>
          <option value="6">Economy</option>
        </select>
      </div>
        
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

      <div className="pagination-container">
        <button 
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {currentPage + 1} of {Math.ceil(totalNews / itemsPerPage)} (Total: {totalNews} news)
        </span>
        <button 
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={currentPage >= Math.ceil(totalNews / itemsPerPage) - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
