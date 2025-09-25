import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'unread' ? '/api/notifications/unread' : '/api/notifications';
      const response = await axios.get(endpoint, {
        withCredentials: true
      });
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/notifications/unread-count', {
        withCredentials: true
      });
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`/api/notifications/mark-read/${notificationId}`, {}, {
        withCredentials: true
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.post('/api/notifications/mark-all-read', {}, {
        withCredentials: true
      });
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'EMPLOYEE_REQUEST_APPROVED':
        return '✓';
      case 'EMPLOYEE_REQUEST_REJECTED':
        return '✗';
      default:
        return 'ℹ';
    }
  };

  const getNotificationClass = (type, isRead) => {
    let baseClass = 'notification-item ';
    if (!isRead) baseClass += 'unread ';
    
    switch (type) {
      case 'EMPLOYEE_REQUEST_APPROVED':
        return baseClass + 'notification-success';
      case 'EMPLOYEE_REQUEST_REJECTED':
        return baseClass + 'notification-danger';
      default:
        return baseClass + 'notification-info';
    }
  };

  if (loading) return <div>Loading notifications...</div>;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Notifications {unreadCount > 0 && <span className="badge">{unreadCount}</span>}</h2>
        <div className="notifications-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
          </select>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn btn-secondary">
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <p className="no-notifications">No notifications to display</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={getNotificationClass(notification.type, notification.read)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <small>{new Date(notification.createdAt).toLocaleString()}</small>
              </div>
              {!notification.read && (
                <button 
                  onClick={() => markAsRead(notification.id)}
                  className="mark-read-btn"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .notifications-container {
          margin-top: 2rem;
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .notifications-header h2 {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .badge {
          background: #dc3545;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 14px;
        }

        .notifications-controls {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .filter-select {
          padding: 5px 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .notification-item {
          display: flex;
          align-items: center;
          padding: 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .notification-item.unread {
          background: white;
          border-color: #007bff;
        }

        .notification-success {
          border-left: 4px solid #28a745;
        }

        .notification-danger {
          border-left: 4px solid #dc3545;
        }

        .notification-info {
          border-left: 4px solid #17a2b8;
        }

        .notification-icon {
          font-size: 24px;
          margin-right: 15px;
        }

        .notification-content {
          flex: 1;
        }

        .notification-content h4 {
          margin: 0 0 5px 0;
          font-size: 16px;
        }

        .notification-content p {
          margin: 0 0 5px 0;
          color: #666;
        }

        .notification-content small {
          color: #999;
        }

        .mark-read-btn {
          padding: 5px 10px;
          border: none;
          background: #007bff;
          color: white;
          border-radius: 4px;
          cursor: pointer;
        }

        .no-notifications {
          text-align: center;
          color: #666;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
};

export default Notifications;