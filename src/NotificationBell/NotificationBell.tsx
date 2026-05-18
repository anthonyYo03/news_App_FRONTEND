import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { MdNotifications } from 'react-icons/md';
import { Notification } from '../types/notification';
import socket from './socketClient';
import './NotificationBell.css';


export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [dropdownPos, setDropdownPos] = useState({
    top: 0,
    left: 0,
    maxHeight: 420,
  });

  const PAGE_SIZE = 5;

  const wrapperRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const notifTotalPages = Math.ceil(notifications.length / PAGE_SIZE);

  const paginatedNotifs = notifications.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Load persisted notifications on mount
 // Load persisted notifications on mount
useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const res = await axios.get<{ notifications: Notification[] }>(
        `${process.env.REACT_APP_BACKEND_URL}/api/notification/all`,
        { withCredentials: true }
      );
      console.log('✅ Notifications fetched:', res.data);
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error('❌ Failed to fetch notifications:', err);
    }
  };

  fetchNotifications();
}, []);

// Listen for real-time notifications
useEffect(() => {
  console.log('🔌 Socket status:', socket.connected ? 'connected' : 'disconnected');

  const handler = (notification: Notification) => {
    console.log('🔔 New real-time notification received:', notification);
    setNotifications((prev) => [notification, ...prev]);
  };

  socket.on('connect', () => console.log('✅ Socket connected:', socket.id));
  socket.on('connect_error', (err) => console.error('❌ Socket connection error:', err.message));
  socket.on('new-notification', handler);

  return () => {
    socket.off('connect');
    socket.off('connect_error');
    socket.off('new-notification', handler);
  };
}, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();

      const dropdownWidth = Math.min(340, window.innerWidth - 16);

      let left = rect.left;

      if (left + dropdownWidth > window.innerWidth - 8) {
        left = window.innerWidth - dropdownWidth - 8;
      }

      if (left < 8) left = 8;

      const top = rect.bottom + 10;

      const maxHeight = Math.max(
        200,
        window.innerHeight - top - 16
      );

      setDropdownPos({
        top,
        left,
        maxHeight,
      });
    }

    setIsOpen((prev) => !prev);
  };

  const markAsRead = async (id: number) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/notification/${id}/read`,
        {},
        { withCredentials: true }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n.notification_id === id ? { ...n, is_read: true } : n
        )
      );
    } catch {}
  };

  const clearAll = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/notification/clear-all`, {
        withCredentials: true,
      });

      setNotifications([]);
    } catch {}
  };

  const dropdownPortal = isOpen ? (
    <div
      ref={dropdownRef}
      className="notification-dropdown"
      style={{
        position: 'fixed',
        top: dropdownPos.top,
        left: dropdownPos.left,
        maxHeight: dropdownPos.maxHeight,
        width: Math.min(340, window.innerWidth - 16),
      }}
    >
      <div className="notification-dropdown-header">
        <h3>Notifications</h3>
        {notifications.length > 0 && (
          <button className="clear-all-btn" onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="notification-empty-state">No notifications</div>
      ) : (
        <>
          <div className="notification-list">
            {paginatedNotifs.map((n) => (
              <div
                key={n.notification_id}
                className={`notification-item ${!n.is_read ? 'unread' : ''}`}
              >
                <div className="notification-item-header">
                  <h4 className="notification-item-title">{n.title}</h4>
                  {!n.is_read && (
                    <button
                      className="mark-as-read-btn"
                      onClick={() => markAsRead(n.notification_id)}
                    >
                      Mark as read
                    </button>
                  )}
                </div>

                <p className="notification-item-message">{n.message}</p>

                <span className="notification-item-time">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {notifTotalPages > 1 && (
            <div className="notification-pagination">
              <button
                className="pagination-btn"
                onClick={() =>
                  setPage((p) => Math.max(1, p - 1))
                }
                disabled={page === 1}
              >
                Prev
              </button>

              <span className="pagination-info">
                Page {page} of {notifTotalPages}
              </span>

              <button
                className="pagination-btn"
                onClick={() =>
                  setPage((p) =>
                    Math.min(notifTotalPages, p + 1)
                  )
                }
                disabled={page === notifTotalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  ) : null;

  return (
    <div ref={wrapperRef} className="notification-bell-wrapper">
      <button
        ref={btnRef}
        onClick={handleToggle}
        className="notification-bell-btn"
        aria-label="Notifications"
        title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'}
      >
        <MdNotifications size={22} />

        {unreadCount > 0 && (
          <span className="unread-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {ReactDOM.createPortal(
        dropdownPortal,
        document.body
      )}
    </div>
  );
}
