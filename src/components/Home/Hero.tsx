'use client';

import { motion } from 'framer-motion';
import { Play, Swords, PlusCircle, LogIn, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import Link from 'next/link';

interface HeroProps {
  isLoggedIn: boolean;
  userName?: string;
}

export default function Hero({ isLoggedIn, userName }: HeroProps) {
  return (
    <section className="relative pt-20 pb-16 px-4 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-purple-600/10 blur-[120px] -z-10 rounded-full" />
      <div className="absolute top-20 left-1/4 w-64 h-64 bg-red-600/10 blur-[100px] -z-10 rounded-full" />

      <div className="max-w-4xl mx-auto text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="premium" className="mb-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em]">
            Ludo Wins = Real Cash In!
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-[0.9] text-white">
            PLAY LUDO & WIN <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600">
              REAL MONEY
            </span>
          </h1>
          <p className="mt-6 text-gray-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            The most trusted real-money Ludo platform. Challenge real players, show your skills, and earn daily!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          {isLoggedIn ? (
            <>
              <Link href="/battles" className="w-full sm:w-auto">
                <Button variant="premium" size="lg" className="w-full sm:w-80 h-16 rounded-2xl text-lg gap-3">
                  <Play className="w-6 h-6 fill-current" /> Play Now
                </Button>
              </Link>
              <Link href="/battles" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-16 px-8 rounded-2xl text-lg gap-2 border-white/10">
                  <PlusCircle className="w-5 h-5" /> Create Battle
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="premium" size="lg" className="w-full sm:w-80 h-16 rounded-2xl text-lg gap-3 group">
                <LogIn className="w-6 h-6" /> Login to Play
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
        </motion.div>

        {/* Floating Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-12 opacity-50 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-white">1.2k+ Active Players</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-white">Instant Withdrawals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-white">Secure Platform</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Inline Badge since Hero is Client and I want to keep it clean
function Badge({ className, variant = "default", children }: { className?: string; variant?: string; children: React.ReactNode }) {
  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
      variant === 'premium' ? 'bg-purple-600/10 text-purple-400 border-purple-500/20' : 'bg-white/5 text-gray-400 border-white/10'
    } ${className}`}>
      {children}
    </div>
  );
}
