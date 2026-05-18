import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FiShare2, FiX, FiTwitter, FiFacebook, FiLink, FiMail,
  FiCheck
} from 'react-icons/fi';
import { FaWhatsapp, FaTelegram, FaLinkedin } from 'react-icons/fa';
import './Share.css';

interface ShareProps {
  newsId: number;
  newsTitle?: string;
}

const API = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export default function Share({ newsId, newsTitle }: ShareProps) {
  const [open, setOpen] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const newsUrl = `${window.location.origin}/news/${newsId}`;
  const encodedUrl = encodeURIComponent(newsUrl);
  const encodedTitle = encodeURIComponent(newsTitle || 'Check out this news!');

  useEffect(() => {
    fetchShareCount();
  }, [newsId]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const fetchShareCount = async () => {
    try {
      const res = await axios.get(`${API}/api/share/count/${newsId}`, {
        withCredentials: true,
      });
      setShareCount(res.data.totalShares);
    } catch (_) {}
  };

  // Record the share in the backend then open the platform URL
  const recordAndOpen = async (platformUrl: string) => {
    try {
      await axios.post(
        `${API}/api/share/createShareForNews/${newsId}`,
        {},
        { withCredentials: true }
      );
      setShareCount(prev => prev + 1);
    } catch (_) {
      // Share count increment failing shouldn't block the actual share
    }
    window.open(platformUrl, '_blank', 'noopener,noreferrer');
    setOpen(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(newsUrl);
      setCopied(true);
      toast.success('Link copied!');
      // Record backend share for copy too
      try {
        await axios.post(
          `${API}/api/share/createShareForNews/${newsId}`,
          {},
          { withCredentials: true }
        );
        setShareCount(prev => prev + 1);
      } catch (_) {}
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      toast.error('Failed to copy link');
    }
  };

  const platforms = [
    {
      name: 'WhatsApp',
      icon: <FaWhatsapp size={22} />,
      color: '#25D366',
      url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: 'Twitter / X',
      icon: <FiTwitter size={22} />,
      color: '#000000',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: 'Facebook',
      icon: <FiFacebook size={22} />,
      color: '#1877F2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: 'Telegram',
      icon: <FaTelegram size={22} />,
      color: '#229ED9',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: 'LinkedIn',
      icon: <FaLinkedin size={22} />,
      color: '#0A66C2',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: 'Email',
      icon: <FiMail size={22} />,
      color: '#EA4335',
      url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    },
  ];

  return (
    <>
      {/* Trigger — sits next to Like and Comments */}
      <div className="share-trigger" onClick={() => setOpen(true)}>
        <button className="share-trigger-btn" aria-label="Share this post">
          <FiShare2 size={22} />
        </button>
        <span className="share-trigger-count">
          {shareCount === 0 ? 'Share' : `${shareCount} ${shareCount === 1 ? 'share' : 'shares'}`}
        </span>
      </div>

      {/* Overlay + Sheet */}
      {open && (
        <div
          className="share-overlay"
          ref={overlayRef}
          onClick={(e) => { if (e.target === overlayRef.current) setOpen(false); }}
        >
          <div className="share-sheet">

            {/* Handle bar (mobile feel) */}
            <div className="share-handle" />

            {/* Header */}
            <div className="share-header">
              <div className="share-header-text">
                <FiShare2 size={17} />
                <span>Share</span>
              </div>
              {newsTitle && (
                <p className="share-subtitle">{newsTitle}</p>
              )}
              <button className="share-close-btn" onClick={() => setOpen(false)}>
                <FiX size={18} />
              </button>
            </div>

            {/* Platform grid */}
            <div className="share-platforms">
              {platforms.map(p => (
                <button
                  key={p.name}
                  className="share-platform-btn"
                  onClick={() => recordAndOpen(p.url)}
                  style={{ '--platform-color': p.color } as React.CSSProperties}
                >
                  <span className="share-platform-icon">{p.icon}</span>
                  <span className="share-platform-name">{p.name}</span>
                </button>
              ))}
            </div>

            {/* Copy link row */}
            <div className="share-copy-row">
              <div className="share-copy-url">
                <FiLink size={14} />
                <span>{newsUrl}</span>
              </div>
              <button
                className={`share-copy-btn ${copied ? 'copied' : ''}`}
                onClick={handleCopyLink}
              >
                {copied ? <><FiCheck size={14} /> Copied!</> : 'Copy link'}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}