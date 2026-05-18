'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gamepad2, Wallet, User, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { name: 'Home', icon: Home, href: '/dashboard' },
  { name: 'Battles', icon: Gamepad2, href: '/dashboard/battles' },
  { name: 'Wallet', icon: Wallet, href: '/dashboard/wallet' },
  { name: 'Profile', icon: User, href: '/dashboard/profile' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col pb-20">
      {/* Header */}
      <header className="h-16 border-b border-white/5 bg-[#121212]/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">
          BAJIGER LUDO
        </h1>
        <Link href="/dashboard/support" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
          <MessageCircle className="w-5 h-5 text-green-500" />
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#121212] border-t border-white/5 flex items-center justify-around z-50 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 min-w-[64px] relative"
            >
              <div className={`
                p-2 rounded-xl transition-all duration-300
                ${active ? 'text-purple-500' : 'text-gray-500'}
              `}>
                <item.icon className={`w-6 h-6 ${active ? 'fill-purple-500/10' : ''}`} />
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-widest ${active ? 'text-purple-500' : 'text-gray-500'}`}>
                {item.name}
              </span>
              {active && (
                <motion.div 
                  layoutId="activeNav"
                  className="absolute -top-1 w-8 h-1 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
