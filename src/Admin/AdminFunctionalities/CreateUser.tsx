import { AddUser } from "../../types/user"
import axios from 'axios';
import toast from 'react-hot-toast';
import {useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { checkPasswordStrength } from '../../utils/password';
import './CreateUser.css';


export default function CreateUser() {
 const navigate = useNavigate();
  const [createUser, setCreateUser] = useState<AddUser>({ email: '', username: '', password: '', user_type_id: 2 });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState('');
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setCreateUser({ ...createUser, password: pwd });
    const result = checkPasswordStrength(pwd);
    setStrength(result.value); // update strength for display
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = checkPasswordStrength(createUser.password); // final check on submit
    if (result.value !== "Strong") {
      toast.error("Password must be strong");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/user/createUser`, createUser,{ withCredentials: true });
      toast.success('Account created successful!');
      setTimeout(() => navigate('/adminDashboard'), 1000);
      setCreateUser({ email: '', username: '', password: '', user_type_id: 2 });
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
          
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              className="form-input"
              value={createUser.username}
              onChange={e => setCreateUser({ ...createUser, username: e.target.value })}
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={createUser.email}
              onChange={e => setCreateUser({ ...createUser, email: e.target.value })}
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
                value={createUser.password}
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
            {createUser.password && (
              <p className={`strength-text ${strength.toLowerCase()}`}>
                Password Strength: {strength}
              </p>
            )}
          </div>

<div className="form-group">
            <label htmlFor="user_type" className="form-label">User Type</label>
            <select
              id="user_type"
              className="form-input"
              value={createUser.user_type_id}
              onChange={e => setCreateUser({ ...createUser, user_type_id: Number(e.target.value) })}
            >
              <option value={1}>Journalist</option>
              <option value={2}>Reader</option>
              <option value={3}>Admin</option>
            </select>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-ghost" 
              disabled={loading} 
              onClick={() => navigate('/adminDashboard')}
            >
              Cancel
            </button>

            <button 
              type="submit" 
              className="btn btn-gold" 
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
