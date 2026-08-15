import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { MotionView, MotionStaggerContainer, MotionStaggerItem } from '../common/MotionView';
import { Button } from '../ui/Button';
import { Bell, CheckCircle2, Clock, AlertTriangle, RefreshCw, Mail } from 'lucide-react';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { NotificationItem } from '../../types';
import toast from 'react-hot-toast';

export default function NotificationsView() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await ApiService.getNotifications(user.id);
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (id: string) => {
    try {
      await ApiService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      toast.success('Notification marked as read');
    } catch (err) {
      toast.error('Failed to update notification status');
    }
  };

  return (
    <MotionView className="space-y-6 text-slate-900 dark:text-slate-100 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-600 dark:text-blue-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-slate-900 dark:text-white">System Notifications & Expiry Alerts</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Automated expiration alerts, renewal task assignments, and compliance reminders.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadNotifications}
          isLoading={loading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh Feed
        </Button>
      </div>

      {/* Notifications List */}
      <MotionStaggerContainer className="space-y-3">
        {loading ? (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 text-xs">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 dark:text-emerald-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Caught Up!</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">You have no unread notifications or urgent compliance alerts.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <MotionStaggerItem
              key={n.id}
              whileHover={{ scale: 1.005 }}
              className={`p-4 rounded-lg border flex items-center justify-between gap-4 transition ${
                n.read
                  ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 text-slate-500 dark:text-slate-400'
                  : 'bg-white dark:bg-slate-900 border-blue-300 dark:border-blue-500/40 text-slate-900 dark:text-slate-100 shadow-lg'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`p-2.5 rounded-lg border shrink-0 ${
                    n.type === 'danger'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : n.type === 'warning'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                  }`}
                >
                  {n.type === 'danger' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : n.type === 'warning' ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{n.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.read && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleMarkRead(n.id)}
                >
                  Mark as Read
                </Button>
              )}
            </MotionStaggerItem>
          ))
        )}
      </MotionStaggerContainer>
    </MotionView>
  );
}
