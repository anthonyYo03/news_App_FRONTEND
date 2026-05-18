import axios from 'axios';
import toast from 'react-hot-toast';
import { UserLogin } from '../types/user';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState<UserLogin>({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!login.username || !login.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try { 
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user/login`, login,{ withCredentials: true });
      console.log(response.data);
      toast.success('Login successful!');
      
      // 
      const role = response.data.type;
      if (role === 'reader') {
        setTimeout(() => navigate('/readerDashboard'), 1000);
      } else if (role === 'journalist') {
        setTimeout(() => navigate('/journalistDashboard'), 1000);
      } else if (role === 'admin') {
        setTimeout(() => navigate('/adminDashboard'), 1000);
      }
     
      setLogin({ username: '', password: '' });
      
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed.');
      console.error(err);
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={login.username}
              onChange={e => setLogin({ ...login, username: e.target.value })}
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-input password-input"
                value={login.password}
                onChange={e => setLogin({ ...login, password: e.target.value })}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div className="button-group">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')} disabled={loading}>
              Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
         
        <div className="forgot-password-link">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

          <div className="register-link">
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
