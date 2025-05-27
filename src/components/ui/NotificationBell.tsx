import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, XIcon, CheckCircle2Icon, Trash2Icon } from 'lucide-react';

// Use the proxy for notifications
const BASE_URL = "http://localhost:4000/api";

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications from your proxy
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${BASE_URL}?endpoint=notifications`);
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data.filter(n => !n.read) : []);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
    // Optionally poll every minute:
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Mark notification as read and remove from list
  const markAsRead = (id: number) => {
    setNotifications(notifications => notifications.filter(n => n.id !== id));
    // Optionally, send to backend to mark as read
    fetch(`${BASE_URL}?endpoint=notifications/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    }).catch(() => {});
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    // Optionally, send to backend to clear all
    fetch(`${BASE_URL}?endpoint=notifications/clear-all`, {
      method: 'POST'
    }).catch(() => {});
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications([]);
    fetch(`${BASE_URL}?endpoint=notifications/mark-all-read`, {
      method: 'POST'
    }).catch(() => {});
  };

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full relative transition"
        aria-label="Show notifications"
      >
        <BellIcon size={20} className="text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-slide-up"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            <div className="flex gap-2">
              <button
                className="p-1 rounded hover:bg-green-100 transition"
                title="Mark all as read"
                onClick={markAllAsRead}
                aria-label="Mark all as read"
              >
                <CheckCircle2Icon size={18} className="text-green-600" />
              </button>
              <button
                className="p-1 rounded hover:bg-red-100 transition"
                title="Clear all"
                onClick={clearAll}
                aria-label="Clear all"
              >
                <Trash2Icon size={18} className="text-red-600" />
              </button>
              <button
                className="p-1 rounded hover:bg-gray-200 transition"
                title="Close"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
              >
                <XIcon size={18} className="text-gray-500" />
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <span className="block text-2xl mb-2">🎉</span>
                No new notifications
              </div>
            ) : (
              notifications.slice(0, 10).map(notification => (
                <div
                  key={notification.id}
                  className={`flex items-start justify-between p-4 border-b border-gray-200 hover:bg-blue-50 transition cursor-pointer`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div>
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <button
                    className="ml-2 p-1 rounded hover:bg-green-100 transition"
                    title="Mark as read"
                    onClick={e => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                  >
                    <CheckCircle2Icon size={18} className="text-green-600" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};