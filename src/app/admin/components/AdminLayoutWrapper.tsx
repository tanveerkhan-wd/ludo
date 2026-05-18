'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

interface AdminLayoutWrapperProps {
  children: ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white flex overflow-x-hidden selection:bg-purple-500/30">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-72 z-50">
        <AdminSidebar onLogout={handleLogout} />
      </aside>

      {/* Sidebar - Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-80 z-[70] lg:hidden shadow-[0_0_50px_rgba(0,0,0,0.8)]"
            >
              <AdminSidebar onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:ml-72 min-w-0">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} user={user} />
        
        <main className="flex-1 p-4 lg:p-12 xl:p-16 max-w-[1920px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          >
            {children}
          </motion.div>
        </main>

        <footer className="px-12 py-8 border-t border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-bold tracking-widest uppercase">
            © {new Date().getFullYear()} <span className="text-white">Bajiger Ludo</span> 
            <span className="mx-3 text-gray-800">|</span>
            <span className="text-purple-500/80 tracking-tighter">v1.0.4-stable</span>
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[10px] font-semibold text-gray-600 hover:text-white transition-colors uppercase tracking-widest">Support</a>
            <a href="#" className="text-[10px] font-semibold text-gray-600 hover:text-white transition-colors uppercase tracking-widest">Docs</a>
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
          </div>
        </footer>
      </div>
    </div>
  );
}
