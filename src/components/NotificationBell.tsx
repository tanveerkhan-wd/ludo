'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bell, Check, Trash2, ExternalLink, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn, Badge } from './ui';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=5');
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearAll = async () => {
    try {
      await fetch('/api/notifications', { method: 'DELETE' });
      setNotifications([]);
      setUnreadCount(0);
      toast.success('Notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'WELCOME': return 'bg-purple-500';
      case 'REFERRAL': return 'bg-green-500';
      case 'BATTLE_RESULT': return 'bg-blue-500';
      case 'WITHDRAWAL_APPROVED': return 'bg-green-600';
      case 'WITHDRAWAL_REJECTED': return 'bg-red-500';
      case 'ADMIN_ALERT': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors relative"
      >
        <Bell className="w-5 h-5 text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/20" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-3 w-80 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <h3 className="font-bold text-sm">Notifications</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={markAllAsRead}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors"
                    title="Mark all as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={clearAll}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-gray-500 hover:text-red-500 transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2 opacity-20" />
                    <p className="text-xs text-gray-500 font-medium">All caught up!</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        if (!n.isRead) markAsRead(n.id);
                        if (n.link) {
                          router.push(n.link);
                          setIsOpen(false);
                        }
                      }}
                      className={cn(
                        "p-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer relative group",
                        !n.isRead && "bg-purple-500/[0.03]"
                      )}
                    >
                      <div className="flex gap-3">
                        <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", getTypeColor(n.type))} />
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between gap-2">
                            <p className={cn("text-xs font-bold leading-none", !n.isRead ? "text-white" : "text-gray-400")}>
                              {n.title}
                            </p>
                            <span className="text-[10px] text-gray-600 font-medium shrink-0">
                              {formatDistanceToNow(new Date(n.createdAt))} ago
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-normal line-clamp-2">
                            {n.message}
                          </p>
                          {n.link && (
                            <div className="flex items-center gap-1 text-[9px] font-bold text-purple-500 uppercase tracking-widest pt-1">
                              View Details <ExternalLink className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                      </div>
                      {!n.isRead && (
                        <div className="absolute right-2 bottom-2 w-1.5 h-1.5 bg-purple-500 rounded-full" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <Link 
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="block p-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white bg-white/[0.02] border-t border-white/10 transition-colors"
              >
                View All Notifications
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
