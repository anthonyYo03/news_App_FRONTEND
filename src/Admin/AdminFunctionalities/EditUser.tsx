import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { editUser } from '../../types/user';
import { checkPasswordStrength } from '../../utils/password';
import './EditUser.css';

export default function EditUser() {
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState('');

  const [editUser, setEditUser] = useState<editUser>({
    email: location.state?.email || '',
    username: location.state?.username || '',
    password: location.state?.password || '',
    user_type_id: location.state?.user_type_id
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;

    setEditUser({ ...editUser, password: pwd });

    const result = checkPasswordStrength(pwd);

    setStrength(result.value);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editUser.email.trim() || !editUser.username.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/user/updateUserByAdmin/${id}`,
        editUser,
        { withCredentials: true }
      );

      toast.success('User updated successfully');

      navigate(`/adminGetOneUsers/${id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <h2 className="page-title">
          Edit <span>User</span>
        </h2>

        
      </div>

      <div className="form-card">
        <form onSubmit={handleEdit}>
          <div className="form-field">
            <label className="form-lbl">Email</label>

            <input
              type="email"
              className="form-inp"
              placeholder="Enter Email"
              value={editUser.email}
              onChange={(e) =>
                setEditUser({ ...editUser, email: e.target.value })
              }
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label htmlFor="username" className="form-label">
              Username
            </label>

            <input
              type="text"
              id="username"
              className="form-input"
              value={editUser.username}
              onChange={(e) =>
                setEditUser({ ...editUser, username: e.target.value })
              }
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>

            <div className="password-input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-input password-input"
                value={editUser.password}
                onChange={handlePasswordChange}
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

            {editUser.password && (
              <p className={`strength-text ${strength.toLowerCase()}`}>
                Password Strength: {strength}
              </p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="user_type" className="form-label">
              User Type
            </label>

            <select
              id="user_type"
              className="form-input"
              value={editUser.user_type_id}
              onChange={(e) =>
                setEditUser({
                  ...editUser,
                  user_type_id: Number(e.target.value)
                })
              }
            >
              <option value={1}>Journalist</option>
              <option value={2}>Reader</option>
              <option value={3}>Admin</option>
            </select>
          </div>

          

          <div className="form-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate(`/adminGetOneUsers/${id}`)}
              disabled={loading}
            >
               Cancel
            </button>

            <button
              type="submit"
              className="btn-gold"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}