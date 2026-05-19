import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import prisma from '@/lib/prisma';
import Hero from '@/components/Home/Hero';
import WalletSummary from '@/components/Home/WalletSummary';
import LiveBattles from '@/components/Home/LiveBattles';
import InfoSection from '@/components/Home/InfoSection';
import ReferralPromo from '@/components/Home/ReferralPromo';
import { Button } from '@/components/ui';
import { MessageSquare, Download } from 'lucide-react';
import Link from 'next/link';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.id) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        walletBalance: true,
        referralCode: true,
        userType: true,
      }
    });

    return user;
  } catch (error) {
    return null;
  }
}

async function getOpenBattles() {
  try {
    const battles = await prisma.battle.findMany({
      where: { status: 'OPEN' },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { name: true, avatar: true } }
      }
    });
    
    // Explicitly serialize for Client Components
    return battles.map(b => ({
      id: b.id,
      battleId: b.battleId,
      entryFee: b.entryFee.toString(),
      prizeAmount: b.prizeAmount.toString(),
      status: b.status,
      createdAt: b.createdAt.toISOString(),
      creator: {
        name: b.creator.name,
        avatar: b.creator.avatar,
      }
    }));
  } catch (error) {
    return [];
  }
}

export default async function HomePage() {
  const user = await getCurrentUser();
  const battles = await getOpenBattles();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Navbar (Mini version for Home) */}
      <nav className="fixed top-0 w-full z-[100] bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 h-20">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-red-600 flex items-center justify-center font-bold text-xl">B</div>
            <span className="text-2xl font-black italic tracking-tighter">BAJIGER LUDO</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-gray-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Battles</Link>
            <Link href="#referral" className="hover:text-white transition-colors">Earn</Link>
            <Link href="#support" className="hover:text-white transition-colors">Support</Link>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link href={user.userType === 'Admin' ? '/admin' : '/dashboard'}>
                <Button variant="outline" className="rounded-xl border-white/10 text-xs font-bold uppercase">
                  {user.userType === 'Admin' ? 'Admin Panel' : 'Dashboard'}
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="premium" className="px-6 rounded-xl text-xs font-bold uppercase">Login</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Hero isLoggedIn={isLoggedIn} userName={user?.name} />
        <WalletSummary isLoggedIn={isLoggedIn} balance={user ? parseFloat(user.walletBalance.toString()) : 0} />
        
        <div className="mt-20">
          <LiveBattles isLoggedIn={isLoggedIn} battles={battles as any} />
        </div>

        <InfoSection />

        <div id="referral">
          <ReferralPromo isLoggedIn={isLoggedIn} referralCode={user?.referralCode} />
        </div>

        {/* Support Banner */}
        <section id="support" className="py-20 px-4 bg-gradient-to-b from-transparent to-purple-900/10">
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#121212] border border-white/5 rounded-[2.5rem] p-8 md:p-12 text-center space-y-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/10 blur-[80px]" />
              
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Need Help?</h2>
                <p className="text-gray-400 max-w-md mx-auto">Our support team is available 24/7 to help you with deposits, withdrawals, or game disputes.</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button variant="premium" className="h-14 px-10 rounded-2xl gap-2 w-full sm:w-auto font-bold uppercase tracking-widest text-xs">
                  <MessageSquare className="w-5 h-5" /> Chat on WhatsApp
                </Button>
                <Button variant="outline" className="h-14 px-10 rounded-2xl gap-2 w-full sm:w-auto font-bold uppercase tracking-widest text-xs border-white/10">
                  <Download className="w-5 h-5" /> Download App (PWA)
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-[#080808]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-red-600 flex items-center justify-center font-bold text-sm">B</div>
              <span className="text-xl font-black italic tracking-tighter">BAJIGER LUDO</span>
            </div>
            <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">© 2026 BAJIGER LUDO. ALL RIGHTS RESERVED.</p>
          </div>

          <div className="flex items-center gap-6">
            <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-purple-600/20 transition-colors">
              <InstagramIcon className="w-5 h-5 text-gray-400" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-purple-600/20 transition-colors">
              <YoutubeIcon className="w-5 h-5 text-gray-400" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-purple-600/20 transition-colors">
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </Link>
          </div>

          <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Responsible Gaming</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
