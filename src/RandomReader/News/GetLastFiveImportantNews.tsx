import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { News as NewsType } from '../../types/news';

export default function GetLastFiveImportantNews() {
  const [news, setNews] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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



  useEffect(() => {
    const fetchImportantNews = async () => {
      try {
        setLoading(true);
        const res = await axios.get<{ news: NewsType[] }>(
          `${process.env.REACT_APP_BACKEND_URL}/api/news/getImportantNews`
        );
        setNews(res.data.news || []);
      } catch (error) {
        toast.error('Failed to load important news');
      } finally {
        setLoading(false);
      }
    };

    fetchImportantNews();
  }, []);

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (news.length === 0) return <div className="text-center py-4">No important news</div>;

  return (
    <div style={{ marginBottom: '2rem' }}>
    <div id="importantNewsCarousel" className="carousel slide" data-bs-ride="carousel">
      
      {/* Indicators */}
      <div className="carousel-indicators">
        {news.map((_, index) => (
          <button
            key={index}
            type="button"
            data-bs-target="#importantNewsCarousel"
            data-bs-slide-to={index}
            className={index === 0 ? 'active' : ''}
          />
        ))}
      </div>

      {/* Slides */}
      <div className="carousel-inner">
        {news.map((item, index) => (
          <div
            key={item.news_id}
            className={`carousel-item ${index === 0 ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/oneNews/${item.news_id}`)}
          >
            {item.image_url ? (
              <img
                src={item.image_url}
                className="d-block w-100"
                alt={item.title}
                style={{ height: '450px', objectFit: 'cover' }}
              />
            ) : (
              <div
                className="d-block w-100 bg-secondary d-flex align-items-center justify-content-center"
                style={{ height: '450px' }}
              >
                <span className="text-white">No Image</span>
              </div>
            )}

            <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-3">
              <span className="badge bg-danger mb-1">Important</span>
              <h5>{item.title}</h5>
              <p className="text-truncate">{item.description}</p>
            </div>

<div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded p-3">
  <span className="badge bg-danger mb-1">Important</span>
  <h5>{item.title}</h5>
  <p className="text-truncate">{item.description}</p>
  <p className="text-white-50 small mb-2">By: {item.author?.username ?? 'Unknown'}</p>
  <p className="text-center text-white-50 small mb-0">{formatDate(item.createdAt)}</p>{/* added */}
</div>

          </div>
        ))}
      </div>

      {/* Controls */}
      <button className="carousel-control-prev" type="button" data-bs-target="#importantNewsCarousel" data-bs-slide="prev"
      style={{ filter: 'invert(1) sepia(1) saturate(5) hue-rotate(180deg)' }}
      >
        <span className="carousel-control-prev-icon" />
      </button>
      <button className="carousel-control-next" type="button" data-bs-target="#importantNewsCarousel" data-bs-slide="next"
      style={{ filter: 'invert(1) sepia(1) saturate(5) hue-rotate(180deg)' }}
      >
        <span className="carousel-control-next-icon" />
      </button>

    </div>
    </div>
  );
}