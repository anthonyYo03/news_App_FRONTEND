import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';



interface Props { id: any; }
export default function DeleteUser({ id }: Props) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/user/delete/${id}`, { withCredentials: true });
      toast.success('User deleted');
      setTimeout(() => navigate('/adminDashboard'), 800);
    } catch (error: any) {
      toast.error(error?.response?.data?.response || 'Could not delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      className="btn btn-danger" 
      onClick={handleDelete} 
      disabled={loading}
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
