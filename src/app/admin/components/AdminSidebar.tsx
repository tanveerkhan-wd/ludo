'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Gamepad2, 
  ArrowDownCircle, 
  Share2, 
  BarChart3, 
  Settings, 
  LogOut,
  X,
  Swords,
  Trophy,
  Wallet,
  ShieldCheck,
  Bell,
  ChevronRight,
  ReceiptText
} from 'lucide-react';
import { cn } from '@/components/ui';

const menuItems = [
  { group: 'Main', items: [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Users', icon: Users, href: '/admin/users' },
    { name: 'Battles', icon: Swords, href: '/admin/battles' },
  ]},
  { group: 'Financial', items: [
    { name: 'Transactions', icon: ReceiptText, href: '/admin/transactions' },
    { name: 'Withdrawals', icon: ArrowDownCircle, href: '/admin/withdrawals' },
    { name: 'Wallets', icon: Wallet, href: '/admin/wallets' },
  ]},
  { group: 'Marketing', items: [
    { name: 'Referrals', icon: Share2, href: '/admin/referrals' },
  ]},
  { group: 'Analytics', items: [
    { name: 'Reports', icon: BarChart3, href: '/admin/reports' },
  ]},
  { group: 'System', items: [
    { name: 'Settings', icon: Settings, href: '/admin/settings' },
  ]},
];

interface AdminSidebarProps {
  onClose?: () => void;
  onLogout: () => void;
}

export default function AdminSidebar({ onClose, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border-r border-white/5 w-72">
      {/* Brand Logo */}
      <div className="p-8 flex items-center justify-between">
        <Link href="/admin" className="group flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.3)] group-hover:scale-110 transition-transform">
            <span className="text-xl font-bold text-white">B</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tighter text-white leading-none">BAJIGER</span>
            <span className="text-[10px] font-semibold text-purple-500 uppercase tracking-[0.2em] mt-1">Admin Panel</span>
          </div>
        </Link>
        <button onClick={onClose} className="lg:hidden p-3 hover:bg-white/5 rounded-2xl transition-colors">
          <X className="w-6 h-6 text-gray-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-10 overflow-y-auto py-4 no-scrollbar">
        {menuItems.map((group, groupIdx) => (
          <motion.div 
            key={group.group} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: groupIdx * 0.1 }}
            className="space-y-3"
          >
            <p className="px-6 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.3em]">{group.group}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center justify-between px-6 py-3.5 rounded-2xl transition-all group relative",
                      active 
                        ? "bg-purple-600/10 text-white" 
                        : "text-gray-400 hover:bg-white/[0.03] hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <item.icon className={cn(
                        "w-5 h-5 transition-all duration-300",
                        active ? "text-purple-400 scale-110" : "text-gray-500 group-hover:text-purple-400"
                      )} />
                      <span className="font-semibold text-sm tracking-tight">{item.name}</span>
                    </div>

                    {active ? (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-transparent border-l-4 border-purple-600 rounded-2xl"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        ))}
      </nav>

      {/* Logout Footer */}
      <div className="p-6 mt-auto">
        <button 
          onClick={onLogout}
          className="flex items-center gap-4 px-6 py-4 w-full text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-2xl transition-all group font-semibold text-sm border border-red-500/10"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Logout Session</span>
        </button>
      </div>
    </div>
  );
}
