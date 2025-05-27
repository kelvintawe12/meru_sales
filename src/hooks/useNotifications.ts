import { useState, useEffect } from 'react';

export interface Notification {
  id: number;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}

const BASE_URL = "https://script.google.com/macros/s/AKfycbzuyhsb1VsdCEPyqOTXjHSU9bE6-yv6sfLtHGN8Jda6YLP1YpdyeOk6Wheyi6OGa3yt4Q/exec";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE_URL}?endpoint=notifications`)
      .then(res => res.json())
      .then(data => setNotifications(Array.isArray(data) ? data : []))
      .catch(err => console.error('Error fetching notifications:', err))
      .finally(() => setLoading(false));
  }, []);

  // Mark as read is not supported directly in Apps Script unless you implement it
  const markAsRead = async (id: number) => {
    // Optionally, you could POST to a custom endpoint in Apps Script to mark as read
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  // Add notification locally (since Apps Script doesn't support POST for notifications by default)
  const addNotification = (
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    const newNotification: Notification = {
      id: Date.now(),
      message,
      type,
      read: false,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  return { notifications, loading, markAsRead, addNotification };
};