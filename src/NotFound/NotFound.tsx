import { Link } from 'react-router-dom';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-card">
        <div className="notfound-header">
          <h1 className="notfound-code">404</h1>
          <h2>Page Not Found</h2>
          <p>Sorry, the page you're looking for doesn't exist.</p>
        </div>

        <div className="notfound-content">
          <p>It might have been removed, or you may have mistyped the URL.</p>
        </div>

        <Link to="/" className="notfound-btn">
          Go Back Home
        </Link>
      </div>
    </div>
  )
}
