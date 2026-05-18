'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, LogOut, ChevronRight, Shield, Bell, HelpCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  const menuItems = [
    { name: 'KYC Verification', icon: Shield, status: user?.kycStatus || 'Pending', color: 'text-blue-500' },
    { name: 'Notifications', icon: Bell, color: 'text-yellow-500' },
    { name: 'Help & Support', icon: HelpCircle, color: 'text-green-500' },
    { name: 'Terms & Conditions', icon: FileText, color: 'text-gray-400' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center pt-4">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-red-500 rounded-full mx-auto flex items-center justify-center border-4 border-[#121212] shadow-xl mb-4">
          <User className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold">{user?.name}</h2>
        <p className="text-gray-400 text-sm">{user?.phone}</p>
      </div>

      <div className="space-y-3">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl bg-white/5 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                {item.status && (
                  <p className={`text-[10px] font-semibold uppercase ${
                    item.status === 'Verified' ? 'text-green-500' : 'text-yellow-500'
                  }`}>{item.status}</p>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="w-full mt-8 bg-red-600/10 border border-red-600/20 text-red-500 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition-all"
      >
        <LogOut className="w-5 h-5" /> Logout
      </button>
    </div>
  );
}
