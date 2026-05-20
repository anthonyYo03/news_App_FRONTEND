import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkPasswordStrength } from '../utils/password';
import './ResetPassword.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [strength, setStrength] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const id = searchParams.get('id');
  const token = searchParams.get('token');

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const pwd = e.target.value;
    setPassword(pwd);
    setStrength(checkPasswordStrength(pwd).value);
  };

  const getStrengthClassName = () => {
    switch (strength.toLowerCase()) {
      case 'weak':
        return 'strength-weak';
      case 'moderate':
        return 'strength-moderate';
      case 'strong':
        return 'strength-strong';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (!password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!id || !token) {
      setError('Invalid or expired reset link');
      return;
    }

    const result = checkPasswordStrength(password);

    if (result.value !== 'Strong') {
      toast.error('Password must be strong');
      return;
    }

    setIsLoading(true);

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/reset-password?id=${id}&token=${token}`,
        { password }
      );

      toast.success('Password reset successfully!');

      setPassword('');
      setConfirmPassword('');

      setTimeout(() => navigate('/login'), 1000);
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Something went wrong';

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h1>Reset Password</h1>
          <p>Create a new password for your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password" className="form-label">New Password</label>
            <div className="password-input-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input password-input"
                placeholder="Enter new password"
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {password && (
              <div className={`password-strength ${getStrengthClassName()}`}>
                <span className="strength-label">Password Strength:</span>
                <span className="strength-value">{strength}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <div className="password-input-container">
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className="form-input password-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
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
              {isLoading ? 'Resetting...' : 'Reset Password'}
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