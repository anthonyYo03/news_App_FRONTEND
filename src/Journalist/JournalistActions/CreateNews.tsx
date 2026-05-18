import React, { useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { createNews } from '../../types/news';
import './CreateNews.css';


export default function CreateNews() {
  const [news, setNews] = useState<createNews>({
    title: '',
    description: '',
    is_important: false,
    image_url: '',
    news_type_id: 1
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, or WEBP images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setNews((prev) => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!news.title.trim() || !news.description.trim()) {
      toast.error('Please fill title and description fields');
      return;
    }
    setLoading(true);
    try {
      let payload: any = { ...news };

      if (imageFile) {
        // If your backend accepts multipart/form-data:
        const formData = new FormData();
        formData.append('title', news.title);
        formData.append('description', news.description);
        formData.append('is_important', String(news.is_important));
        formData.append('image', imageFile);

        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/news/createNews`,
          formData,
          { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else {
        // No image — send JSON as before
        await axios.post(
          `${process.env.REACT_APP_BACKEND_URL}/api/news/createNews`,
          payload,
          { withCredentials: true }
        );
      }

      toast.success('News created successfully');
      navigate('/journalistDashboard');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to create News');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <h2 className="page-title">
          Create <span>News</span>
        </h2>
        
      </div>

      <div className="form-card">
        <form onSubmit={handleCreate}>
          {/* Title */}
          <div className="form-field">
            <label className="form-lbl">Title</label>
            <input
              type="text"
              className="form-inp"
              placeholder="News title"
              value={news.title}
              onChange={(e) => setNews({ ...news, title: e.target.value })}
              disabled={loading}
            />
          </div>

          {/* Description */}
          <div className="form-field">
            <label className="form-lbl">Description</label>
            <textarea
              className="form-inp"
              placeholder="Write the news content here"
              rows={5}
              value={news.description}
              onChange={(e) =>
                setNews({ ...news, description: e.target.value })
              }
              disabled={loading}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Image Upload */}
          <div className="form-field">
            <label className="form-lbl">Image (optional)</label>

            {imagePreview ? (
              <div className="image-preview-wrapper">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button
                  type="button"
                  className="btn-ghost image-remove-btn"
                  onClick={removeImage}
                  disabled={loading}
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <div
                className="image-dropzone"
                onClick={() => !loading && fileInputRef.current?.click()}
              >
                <span className="image-dropzone-icon">🖼️</span>
                <span className="image-dropzone-text">
                  Click to upload an image
                </span>
                <span className="image-dropzone-hint">
                  JPEG, PNG, GIF or WEBP · max 5 MB
                </span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              style={{ display: 'none' }}
              onChange={handleImageChange}
              disabled={loading}
            />
          </div>

          {/* Is Important Toggle */}
          <div className="form-field form-field--inline">
            <label className="form-lbl" htmlFor="is-important-toggle">
              Mark as Important
            </label>
            <button
              id="is-important-toggle"
              type="button"
              role="switch"
              aria-checked={news.is_important}
              className={`toggle-btn ${news.is_important ? 'toggle-btn--on' : ''}`}
              onClick={() =>
                setNews((prev) => ({
                  ...prev,
                  is_important: !prev.is_important,
                }))
              }
              disabled={loading}
            >
              <span className="toggle-knob" />
            </button>
            <span className="toggle-label">
              {news.is_important ? 'Yes — highlighted for readers' : 'No'}
            </span>
          </div>

<div className="form-field">
            <label className="form-lbl">News Type</label>
            <select
              className="form-inp"
              value={news.news_type_id}
              onChange={(e) => setNews({ ...news, news_type_id: Number(e.target.value) })}
              disabled={loading}
            >
              <option value={1}>Local</option>
              <option value={2}>Politics</option>
              <option value={3}>Sports</option>
              <option value={4}>Entertainment</option>
              <option value={5}>International</option>
              <option value={6}>Economy</option>
            </select>
          </div>




          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-ghost"
              onClick={() => navigate('/journalistDashboard')}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-gold" disabled={loading}>
              {loading && <span className="btn-spinner" />}
              {loading ? 'Creating . . .' : 'Create News'}
            </button>
          </div>
        </form>
      </div>

    
    </div>
  );
}