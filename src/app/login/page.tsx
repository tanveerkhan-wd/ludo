'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showReferral, setShowReferral] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, referralCode }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        // Redirect to the dedicated verification page
        router.push(`/login/verify?phone=${phone}`);
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
      {/* Branding */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-12"
      >
        <h1 className="text-5xl font-bold italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600">
          BAJIGER LUDO
        </h1>
        <p className="text-gray-400 mt-2 font-medium tracking-widest uppercase text-xs">Play • Win • Earn</p>
      </motion.div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-600/10 blur-3xl -z-10" />

        <form onSubmit={handleSendOtp} className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Enter your phone number to continue</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                <span className="text-sm font-bold border-r border-white/10 pr-3 mr-1">+91</span>
              </div>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="00000 00000"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-lg tracking-widest font-mono"
                disabled={loading}
                autoFocus
              />
            </div>

            {!showReferral ? (
              <button 
                type="button"
                onClick={() => setShowReferral(true)}
                className="text-xs text-purple-400 font-semibold uppercase tracking-widest hover:text-purple-300 transition-colors"
              >
                Have a referral code?
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <input
                  type="text"
                  maxLength={10}
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="REFERRAL CODE (OPTIONAL)"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm tracking-widest font-bold uppercase"
                  disabled={loading}
                />
              </motion.div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="w-full bg-gradient-to-r from-purple-600 to-red-600 hover:from-purple-500 hover:to-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-lg shadow-purple-600/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                Send OTP <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
      
      <p className="mt-8 text-gray-500 text-xs">By continuing, you agree to our Terms & Conditions</p>
    </div>
  );
}
