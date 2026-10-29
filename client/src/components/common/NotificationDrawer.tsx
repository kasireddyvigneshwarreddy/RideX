import React, { useEffect, useState } from 'react';
import { X, Bell, CheckCheck, Tag, ShieldAlert, Sparkles, Navigation } from 'lucide-react';
import { NotificationItem } from '../../types';
import { notificationsApi } from '../../services/api';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationsChanged: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNotificationsChanged,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.getAll();
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markRead('all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onNotificationsChanged();
    } catch {
      // Ignore
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PROMO':
        return <Tag className="w-4 h-4 text-theme-primary" />;
      case 'SAFETY':
        return <ShieldAlert className="w-4 h-4 text-emerald-500" />;
      case 'RIDE_UPDATE':
        return <Navigation className="w-4 h-4 text-blue-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-theme-surface border-l border-theme-border shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-theme-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-theme-primary-light flex items-center justify-center text-theme-secondary">
                <Bell className="w-5 h-5 text-theme-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-theme-text font-display">Notifications</h2>
                <p className="text-xs text-theme-text-muted">Ride updates, promo coupons & alerts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-theme-text-muted hover:text-theme-text hover:bg-theme-surface-hover"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action bar */}
          <div className="px-6 py-2.5 border-b border-theme-border bg-theme-surface-hover/30 flex items-center justify-between text-xs">
            <span className="text-theme-text-muted font-medium">
              {notifications.filter((n) => !n.isRead).length} unread alerts
            </span>
            <button
              onClick={handleMarkAllRead}
              className="text-theme-primary hover:underline font-bold flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all as read
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {loading ? (
              <div className="text-center py-12 text-sm text-theme-text-muted animate-pulse">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-16 space-y-2">
                <Bell className="w-10 h-10 text-theme-text-muted mx-auto stroke-1" />
                <p className="text-sm font-bold text-theme-text">No notifications yet</p>
                <p className="text-xs text-theme-text-muted">
                  You're all caught up with your ride updates and discounts.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-colors flex items-start gap-3 ${
                    item.isRead
                      ? 'border-theme-border bg-theme-surface'
                      : 'border-theme-primary/40 bg-theme-primary-light/30 shadow-sm'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-theme-surface border border-theme-border flex items-center justify-center shrink-0 shadow-xs">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-theme-text truncate">{item.title}</h4>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-theme-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-theme-text-muted mt-1 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-theme-text-muted/70 mt-1.5 block">
                      {new Date(item.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
