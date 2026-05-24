'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '@/components/ui';
import { toast } from 'sonner';
import { Loader2, Send, Users, User, ShieldAlert } from 'lucide-react';
import { NotificationType } from '@prisma/client';

export default function SendNotificationModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [target, setTarget] = useState('ALL');
  const [userIds, setUserIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<NotificationType>(NotificationType.ADMIN_ALERT);
  const [link, setLink] = useState('');
  const [condition, setCondition] = useState('LOW_BALANCE');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target,
          userIds: target === 'SPECIFIC' ? userIds : undefined,
          condition: target === 'CONDITION' ? condition : undefined,
          title,
          message,
          type,
          link,
        }),
      });

      if (res.ok) {
        toast.success('Notification sent successfully');
        onClose();
        // Reset form
        setTitle('');
        setMessage('');
        setLink('');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to send notification');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Broadcast Notification"
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Selection */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-400">Target Audience</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'ALL', label: 'All Users', icon: Users },
                { id: 'SPECIFIC', label: 'Specific', icon: User },
                { id: 'CONDITION', label: 'Conditional', icon: ShieldAlert },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTarget(t.id)}
                  className={`
                    flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2
                    ${target === t.id 
                      ? 'bg-purple-600/10 border-purple-500 text-purple-500 shadow-lg shadow-purple-500/10' 
                      : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10'}
                  `}
                >
                  <t.icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {target === 'SPECIFIC' && (
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-400">User IDs (Comma separated)</label>
              <Input 
                placeholder="cuid1, cuid2, ..."
                onChange={(e) => setUserIds(e.target.value.split(',').map(id => id.trim()))}
                required
              />
            </div>
          )}

          {target === 'CONDITION' && (
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-400">Select Condition</label>
              <Select value={condition} onChange={(e) => setCondition(e.target.value)}>
                <option value="LOW_BALANCE">Balance &lt; ₹10</option>
                <option value="KYC_PENDING">KYC Pending</option>
              </Select>
            </div>
          )}

          {/* Content */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-400">Notification Title</label>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly Tournament Alert! 🏆"
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-400">Message Content</label>
            <textarea 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter the notification message here..."
              className="w-full h-32 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Notification Type</label>
            <Select value={type} onChange={(e) => setType(e.target.value as NotificationType)}>
              {Object.values(NotificationType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Redirect Link (Optional)</label>
            <Input 
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="e.g., /battles"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-purple-600 to-red-600 border-none h-12"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <span className="flex items-center gap-2 uppercase tracking-widest font-black text-xs">
                Broadcast Now <Send className="w-4 h-4" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
