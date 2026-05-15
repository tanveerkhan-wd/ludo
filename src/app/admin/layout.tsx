'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Gamepad2, 
  ArrowDownCircle, 
  Share2, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { name: 'Users', icon: Users, href: '/admin/users' },
  { name: 'Battles/Games', icon: Gamepad2, href: '/admin/battles' },
  { name: 'Withdrawals', icon: ArrowDownCircle, href: '/admin/withdrawals' },
  { name: 'Referrals', icon: Share2, href: '/admin/referrals' },
  { name: 'Reports', icon: BarChart3, href: '/admin/reports' },
  { name: 'Settings', icon: Settings, href: '/admin/settings' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#121212] border-r border-white/5 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h1 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
              BAJIGER ADMIN
            </h1>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {menuItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${active ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5">
            <button className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-white/5 bg-[#121212]/50 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden lg:block text-sm text-gray-400">
            Welcome back, <span className="text-white font-medium">Administrator</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end hidden sm:flex">
              <span className="text-sm font-medium">Admin User</span>
              <span className="text-[10px] text-purple-500 uppercase font-bold tracking-wider">Super Admin</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-red-500 flex items-center justify-center border-2 border-white/10">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
