import { useEffect, useState } from 'react';
import { getUser } from '../../types/user';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './GetUser.css';

interface GetUsersResponse {
  message: string;
  totalUsers: number;
  count: number;
  users: getUser[];
}

export default function GetUser() {
  const [users, setUsers] = useState<getUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get<GetUsersResponse>(
          `${process.env.REACT_APP_BACKEND_URL}/api/user/getAll`,
          { withCredentials: true }
        );

        setUsers(res.data.users);
      } catch {
        toast.error('Cannot get users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="get-user-page">
        <div className="get-user-header">
          <h1>All Users</h1>
        </div>
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="get-user-page">
        <div className="get-user-header">
          <h1>All Users</h1>
        </div>
        <div className="no-users-message">No users yet.</div>
      </div>
    );
  }

  const searchResults = search.trim()
    ? users
        .filter(
          (u) =>
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        )
        .slice(0, 6)
    : [];

  return (
    <div className="get-user-page">
      <div className="get-user-header">
        <h1>All Users</h1>
      </div>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          onFocus={() => {
            if (search) setShowDropdown(true);
          }}
        />

        {showDropdown && searchResults.length > 0 && (
          <div className="search-dropdown">
            {searchResults.map((u) => (
              <div
                className="dropdown-item"
                key={u.user_id}
                onMouseDown={() => {
                  navigate(`/adminGetOneUsers/${u.user_id}`);
                  setShowDropdown(false);
                  setSearch('');
                }}
              >
                <div className="dropdown-item-username">{u.username}</div>
                <div className="dropdown-item-email">{u.email}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="user-list-container">
        {users.map((u) => (
          <div
            key={u.user_id}
            className="user-card"
            onClick={() => navigate(`/adminGetOneUsers/${u.user_id}`)}
          >
            <h3>{u.username}</h3>
            <p>{u.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}