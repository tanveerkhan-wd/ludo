'use client';

import { useState } from 'react';
import { Modal, Button, Input, Select } from '@/components/ui';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface UserAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserAddModal({ isOpen, onClose, onSuccess }: UserAddModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    userType: 'Player',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('User added successfully');
        onSuccess();
        onClose();
        setFormData({ name: '', phone: '', userType: 'Player' });
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to add user');
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
      title="Add New User"
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]">Full Identity Name</label>
          <Input 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter player full name"
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]">Primary Contact (10 Digits)</label>
          <Input 
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
            placeholder="9876543210"
            maxLength={10}
            required
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.2em]">System Role Type</label>
          <Select 
            value={formData.userType}
            onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
            className="h-12"
          >
            <option value="Player">Strategic Player</option>
            <option value="Admin">System Administrator</option>
          </Select>
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
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
