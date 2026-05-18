import axios from 'axios';
import toast from 'react-hot-toast';
import { UserRegister } from '../../types/user';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { checkPasswordStrength } from '../../utils/password';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const [register, setRegister] = useState<UserRegister>({ email: '', username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState('');
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setRegister({ ...register, password: pwd });
    const result = checkPasswordStrength(pwd);
    setStrength(result.value); // update strength for display
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = checkPasswordStrength(register.password); // final check on submit
    if (result.value !== "Strong") {
      toast.error("Password must be strong");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user/register`, register);
      toast.success('Registration successful!');
      setTimeout(() => navigate('/login'), 1000);
      setRegister({ email: '', username: '', password: '' });
      setStrength('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed.');
      console.error(err);
    }
    finally {
      setLoading(false);
    }
  };


  return (
    <div className="register-container">
      <div className="register-card">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={register.username}
              onChange={e => setRegister({ ...register, username: e.target.value })}
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={register.email}
              onChange={e => setRegister({ ...register, email: e.target.value })}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-input password-input"
                value={register.password}
                onChange={handlePasswordChange} // ✅ live update
                placeholder="Create a password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            {/* ✅ Live password strength display */}
            {register.password && (
              <p className={`strength-text ${strength.toLowerCase()}`}>
                Password Strength: {strength}
              </p>
            )}
          </div>
          <div className="button-group">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/login')} disabled={loading}>
              Back
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
          <div className="login-link">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
