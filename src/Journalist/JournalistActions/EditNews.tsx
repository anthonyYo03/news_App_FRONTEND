import { useState,useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { updateNews } from '../../types/news';

export default function EditNews() {
  const location = useLocation();
  const [editNews, setEditNews] = useState<updateNews>({
    title: location.state?.title || '',
    description: location.state?.description || '',
    is_important: location.state?.is_important || false,
    image_url: location.state?.image_url || '',
    news_type_id: location.state?.news_type_id || 1
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const [, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setEditNews((prev) => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editNews.title.trim() || !editNews.description.trim()) {
      toast.error('Please fill title and description fields');
      return;
    }
    setLoading(true);
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/news/updateNews/${id}`,
        editNews,
        { withCredentials: true }
      );
      toast.success('News updated successfully'); 
      navigate(`journalistNews/${id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update news');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-root">
      <div className="page-header">
        <h2 className="page-title">Edit <span>News</span></h2>
      </div>
      <div className="form-card">
        <form onSubmit={handleEdit}>
          <div className="form-field">
            <label className="form-lbl">Title</label>
            <input
              type="text"
              className="form-inp"
              placeholder="News title"
              value={editNews.title}
              onChange={(e) => setEditNews({ ...editNews, title: e.target.value })}
              disabled={loading}
            />
          </div>
          <div className="form-field">
            <label className="form-lbl">Description</label>
            <textarea
              className="form-inp"
              placeholder="Write the news content"
              rows={5}
              value={editNews.description}
              onChange={(e) => setEditNews({ ...editNews, description: e.target.value })}
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
              aria-checked={editNews.is_important}
              className={`toggle-btn ${editNews.is_important ? 'toggle-btn--on' : ''}`}
              onClick={() =>
                setEditNews((prev) => ({
                  ...prev,
                  is_important: !prev.is_important,
                }))
              }
              disabled={loading}
            >
              <span className="toggle-knob" />
            </button>
            <span className="toggle-label">
              {editNews.is_important ? 'Yes — highlighted for readers' : 'No'}
            </span>
          </div>
{/* Select News Type */}

 <div className="form-field">
            <label className="form-lbl">News Type</label>
            <select
              className="form-inp"
              value={editNews.news_type_id}
              onChange={(e) => setEditNews({ ...editNews, news_type_id: Number(e.target.value) })}
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




{/*  */}

          <div className="form-actions">
            <button type="button" className="btn-ghost" onClick={() => navigate(`/journalistNews/${id}`)} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-gold" disabled={loading}>
              {loading && <span className="btn-spinner" />}
              {loading ? 'Saving . . .' : 'Save Changes'}
            </button>
          </div>




        </form>
      </div>
    </div>
  );
}