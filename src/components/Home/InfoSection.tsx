import { ShieldCheck, Zap, Wallet, Trophy, UserCheck } from 'lucide-react';

const steps = [
  {
    title: 'Login',
    desc: 'Quick login using your phone number & OTP.',
    icon: UserCheck,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  {
    title: 'Add Cash',
    desc: 'Deposit funds securely using UPI or Bank.',
    icon: Wallet,
    color: 'text-green-400',
    bg: 'bg-green-400/10'
  },
  {
    title: 'Join Battle',
    desc: 'Pick a challenge or create your own.',
    icon: Zap,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10'
  },
  {
    title: 'Play & Win',
    desc: 'Play on Ludo King and submit screenshot.',
    icon: Trophy,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10'
  },
  {
    title: 'Withdraw',
    desc: 'Get your winnings instantly to your account.',
    icon: ShieldCheck,
    color: 'text-red-400',
    bg: 'bg-red-400/10'
  }
];

export default function InfoSection() {
  return (
    <section className="py-20 bg-white/[0.01] border-y border-white/5 px-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-purple-600/5 blur-[100px] -z-10" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-600/5 blur-[100px] -z-10" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight">How to Play?</h2>
          <p className="text-gray-500 mt-2 font-medium">Start your earning journey in 5 simple steps</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative group">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[60%] w-full h-[2px] bg-gradient-to-r from-white/10 to-transparent -z-10" />
              )}
              <div className="flex flex-col items-center text-center space-y-4">
                <div className={`w-20 h-20 rounded-3xl ${step.bg} border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                  <step.icon className={`w-10 h-10 ${step.color}`} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white tracking-tight">{step.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed max-w-[150px] mx-auto uppercase font-bold tracking-tighter">
                    {step.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
