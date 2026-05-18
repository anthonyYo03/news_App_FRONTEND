import React from 'react'
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';


interface Props { id: any; }
export default function DeleteNews({ id }: Props) {
 const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleDelete = async () => {
    if (!window.confirm('Delete this announcement? This cannot be undone.')) return;
    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/news/deleteNews/${id}`, { withCredentials: true });
      toast.success('Announcement deleted');
      setTimeout(() => navigate('/hr/announcement'), 800);
    } catch (error: any) {
      toast.error(error?.response?.data?.response || 'Could not delete announcement');
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
