import { getOneUser } from '../../types/user';
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import './GetOneUser.css';
import EditUser from './EditUser';
import DeleteUser from './DeleteUser';


export default function AdminGetOneUser() {
  const [user, setOneUser] = useState<getOneUser | null>(null); // single object, not array
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/user/${id}`, { withCredentials: true });
        console.log(response.data);
        setOneUser(response.data.user || null); // single object
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to load user');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]); // add id as dependency

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="get-one-user-page">
        <div className="get-one-user-header">
          <h1>User Details</h1>
          <button className="back-btn" onClick={() => navigate('/adminDashboard')}>
            ← Back
          </button>
        </div>
        <div className="get-one-user-container">
          <div className="loading">Loading user details...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="get-one-user-page">
        <div className="get-one-user-header">
          <h1>User Details</h1>
          <button className="back-btn" onClick={() => navigate('/adminDashboard')}>
            ← Back
          </button>
        </div>
        <div className="get-one-user-container">
          <div className="error-message">User not found</div>
        </div>
      </div>
    );
  }


  return (
    <div className="get-one-user-page">
      <div className="get-one-user-header">
        <h1>User Details</h1>
        <button className="back-btn" onClick={() => navigate('/adminDashboard')}>
          ← Back
        </button>
      </div>
      <div className="get-one-user-container">
        {user && (
          <div className="user-detail-card">
            <p><strong>User ID:</strong> {user.user_id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>User Type ID:</strong> {user.user_type_id ||'No user type selected'}</p>
            <p><strong>Created At:</strong> {formatDate(user.createdAt)}</p>
          </div>
        )}

        <div className="user-action-buttons">
          <button 
  className="btn btn-secondary"
  onClick={() => navigate(`/adminEditUser/${id}`, {
    state: {
      email: user?.email,
      username: user?.username,
      password: '',
      user_type_id: user?.user_type_id,
    }
  })}
>
  Edit
</button>
          <DeleteUser id={user?.user_id} />
        </div>
      </div>
    </div>
  )
}
