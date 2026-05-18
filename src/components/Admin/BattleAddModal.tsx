'use client';

import { useState } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { toast } from 'sonner';
import { Loader2, Swords } from 'lucide-react';

interface BattleAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BattleAddModal({ isOpen, onClose, onSuccess }: BattleAddModalProps) {
  const [formData, setFormData] = useState({
    entryFee: '',
    roomCode: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/battles/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryFee: Number(formData.entryFee),
          roomCode: formData.roomCode,
        }),
      });

      if (res.ok) {
        toast.success('Battle created successfully');
        onSuccess();
        onClose();
        setFormData({ entryFee: '', roomCode: '' });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create battle');
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
      title="Create Manual Battle"
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Swords className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Entry Fee (₹)</label>
          <Input 
            type="number"
            value={formData.entryFee}
            onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
            placeholder="e.g. 100"
            required
            min={1}
          />
          <p className="text-[10px] text-gray-500">
            Prize will be calculated automatically (80% of total entry).
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400">Room Code (Ludo King)</label>
          <Input 
            value={formData.roomCode}
            onChange={(e) => setFormData({ ...formData, roomCode: e.target.value })}
            placeholder="Enter 8-digit room code"
            maxLength={10}
            required
          />
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
            className="flex-1 bg-gradient-to-r from-purple-600 to-red-600 border-none"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create Battle'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
