import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './ForgetPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);


    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/request-password-reset`,
        { email }
      );

      toast.success('Password reset link sent to your email!');
      setEmail('');
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Something went wrong.';

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>Forgot Password</h1>
          <p>Enter your email address to receive a password reset link</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="button-group">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/login')} 
              disabled={isLoading}
            >
              Back
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>

        <div className="help-text">
          Remember your password? <a href="/login">Sign In</a>
        </div>
      </div>
    </div>
  );
}