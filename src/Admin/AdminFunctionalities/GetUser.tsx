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
  const [selectedUserType, setSelectedUserType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const offset = currentPage * itemsPerPage;
        let url = `${process.env.REACT_APP_BACKEND_URL}/api/user/getAll?limit=${itemsPerPage}&offset=${offset}`;
        
        // Add type filter if selected type is not 'all'
        if (selectedUserType !== 'all') {
          url += `&user_type_id=${selectedUserType}`;
        }
        
        const res = await axios.get<GetUsersResponse>(
          url,
          { withCredentials: true }
        );

        setUsers(res.data.users);
        setTotalUsers(res.data.totalUsers);
      } catch {
        toast.error('Cannot get users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, selectedUserType]);

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

  const totalPages = Math.ceil(totalUsers / itemsPerPage);
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

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

      <div className="filter-section">
        <label htmlFor="userTypeFilter">Filter by Type: </label>
        <select 
          id="userTypeFilter"
          value={selectedUserType} 
          onChange={(e) => {
            setSelectedUserType(e.target.value);
            setCurrentPage(0);
          }}
          className="user-type-dropdown"
        >
          <option value="all">All Users</option>
          <option value="1">Journalist</option>
          <option value="2">Reader</option>
          <option value="3">Admin</option>
        </select>
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

      <div className="pagination-container">
        <button 
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
          disabled={!hasPrevPage}
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {currentPage + 1} of {totalPages} (Total: {totalUsers} users)
        </span>
        <button 
          className="pagination-btn"
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={!hasNextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}