'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, ExternalLink, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Card, CardContent, Badge, cn } from '@/components/ui';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  const fetchNotifications = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?page=${p}&limit=10`);
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
  }, [page]);

  const markAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
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
      toast.success('All marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearAll = async () => {
    if (!confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await fetch('/api/notifications', { method: 'DELETE' });
      setNotifications([]);
      toast.success('Notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'WELCOME': return <Badge variant="premium">WELCOME</Badge>;
      case 'REFERRAL': return <Badge variant="success">REFERRAL</Badge>;
      case 'BATTLE_RESULT': return <Badge variant="info">BATTLE</Badge>;
      case 'WITHDRAWAL_APPROVED': return <Badge variant="success">WALLET</Badge>;
      case 'WITHDRAWAL_REJECTED': return <Badge variant="destructive">WALLET</Badge>;
      case 'ADMIN_ALERT': return <Badge variant="warning">ADMIN</Badge>;
      default: return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pb-20 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black uppercase tracking-tighter italic">Notifications</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={loading || notifications.length === 0}>
            <Check className="w-4 h-4 mr-2" /> Mark All Read
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <p className="text-xs font-bold uppercase tracking-widest">Syncing Data...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Bell className="w-16 h-16 mb-4" />
            <p className="font-bold uppercase tracking-[0.3em] text-sm">No Notifications Yet</p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              {notifications.map((n, index) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className={cn(
                      "relative overflow-hidden group border-white/5 bg-[#121212]/40 backdrop-blur-xl rounded-3xl hover:border-purple-500/30 transition-all duration-500",
                      !n.isRead && "border-purple-500/20"
                    )}
                    onClick={() => {
                      if (!n.isRead) markAsRead(n.id);
                      if (n.link) router.push(n.link);
                    }}
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        {getTypeIcon(n.type)}
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                          {formatDistanceToNow(new Date(n.createdAt))} ago
                        </span>
                      </div>
                      <div className="space-y-2">
                        <h3 className={cn("text-lg font-black italic uppercase leading-tight", !n.isRead ? "text-white" : "text-gray-400")}>
                          {n.title}
                        </h3>
                        <p className="text-sm text-gray-500 leading-relaxed">
                          {n.message}
                        </p>
                      </div>
                      {!n.isRead && (
                        <div className="absolute top-0 right-0 p-4">
                          <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-8">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Page {page} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            <Button 
              variant="ghost" 
              className="w-full text-red-500/50 hover:text-red-500 hover:bg-red-500/5 mt-8 font-bold uppercase tracking-widest text-xs"
              onClick={clearAll}
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clear All History
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
