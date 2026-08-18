import React, { useState, useEffect } from 'react';
import { Bell, Check, X, AlertTriangle, Repeat, Sparkles } from 'lucide-react';
import { api } from '../../lib/api';
import { NotificationItem } from '../../types';

interface NotificationDrawerProps {
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await api.getNotifications();
        setNotifications(data);
      } catch (err) {
        console.error(err);
      }
    }
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-2 font-bold text-xs text-gray-900 dark:text-white">
          <Bell className="h-4 w-4 text-brand-500" />
          <span>Notifications</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 transition-colors ${n.is_read ? 'opacity-60' : 'bg-brand-50/20 dark:bg-brand-950/20'}`}
            >
              <div className="flex items-start justify-between">
                <p className="text-xs font-bold text-gray-900 dark:text-white">{n.title}</p>
                {!n.is_read && (
                  <button
                    onClick={() => handleMarkRead(n.id)}
                    className="text-[10px] text-brand-600 dark:text-brand-400 font-bold hover:underline"
                  >
                    Mark Read
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{n.message}</p>
              <span className="text-[10px] text-gray-400 mt-2 block">{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-xs text-gray-400">
            No unread notifications.
          </div>
        )}
      </div>
    </div>
  );
};
