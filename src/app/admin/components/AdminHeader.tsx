'use client';

import { usePathname } from 'next/navigation';
import { 
  Menu, 
  Search, 
  Bell, 
  User as UserIcon,
  ChevronDown,
  ExternalLink,
  Command
} from 'lucide-react';
import { Button, Input, Avatar, AvatarImage, AvatarFallback, Badge, cn } from '@/components/ui';
import { motion } from 'framer-motion';

interface AdminHeaderProps {
  onMenuClick: () => void;
  user: any;
}

export default function AdminHeader({ onMenuClick, user }: AdminHeaderProps) {
  const pathname = usePathname();

  const getPageTitle = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return 'Dashboard';
    
    // Check if it's the root admin page
    if (segments.length === 1 && segments[0] === 'admin') return 'Dashboard';
    
    // Handle dynamic routes like /admin/battles/[id]
    const lastSegment = segments[segments.length - 1];
    const secondLast = segments[segments.length - 2];
    
    if (secondLast === 'battles' || secondLast === 'users') {
      return `${secondLast.charAt(0).toUpperCase() + secondLast.slice(1)} Detail`;
    }
    
    return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
  };

  return (
    <header className="h-24 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-2xl sticky top-0 z-40 px-4 lg:px-12 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all active:scale-95"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <motion.div 
          key={pathname}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden sm:block"
        >
          <h2 className="text-2xl font-bold tracking-tighter text-white">{getPageTitle()}</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-[0.2em]">System Online</p>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 max-w-xl mx-12 hidden xl:block">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
          <Input 
            placeholder="Search commands, users or battles..." 
            className="pl-14 pr-16 bg-white/[0.03] border-white/5 focus:border-purple-500/50 h-12 rounded-2xl transition-all text-sm font-medium"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
            <Command className="w-3 h-3 text-gray-500" />
            <span className="text-[10px] font-semibold text-gray-500">K</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <div className="flex items-center gap-1 sm:gap-3">
          <Button variant="ghost" size="icon" className="relative rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 h-11 w-11 transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-[#0a0a0a]"></span>
          </Button>
          
          <Button variant="ghost" size="icon" className="rounded-2xl text-gray-400 hover:text-white hover:bg-white/5 h-11 w-11 transition-all hidden sm:flex">
            <ExternalLink className="w-5 h-5" />
          </Button>
        </div>

        <div className="h-10 w-[1px] bg-white/10 hidden sm:block" />

        <div className="flex items-center gap-4 pl-2 sm:pl-0 group cursor-pointer">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-semibold text-white leading-none group-hover:text-purple-400 transition-colors">{user?.name || 'Admin'}</span>
            <Badge variant="premium" className="mt-1.5 py-0 px-2 h-4 text-[8px]">Super Admin</Badge>
          </div>
          
          <div className="relative">
            <Avatar className="w-12 h-12 border-2 border-white/10 p-0.5 ring-2 ring-purple-500/10 group-hover:ring-purple-500/30 transition-all duration-500">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-red-600 text-white">
                {user?.name?.[0] || <UserIcon className="w-5 h-5" />}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0a0a0a]" />
          </div>
        </div>
      </div>
    </header>
  );
}
