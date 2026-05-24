'use client';

import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  AlertTriangle,
  Gavel,
  UserCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/components/ui';

const sections = [
  {
    title: "1. Fair Play Policy",
    icon: ShieldCheck,
    content: "Players must play fairly. Any use of hacks, multiple accounts, or collaborative play will lead to immediate account suspension and forfeiture of funds."
  },
  {
    title: "2. Withdrawal Rules",
    icon: FileText,
    content: "Withdrawals are subject to KYC verification. The minimum withdrawal amount is ₹100. Any suspicious activity may delay processing for up to 7 days for manual audit."
  },
  {
    title: "3. Game Disputes",
    icon: AlertTriangle,
    content: "In case of a dispute, players must submit valid screenshot/video proof within 15 minutes of match completion. Admin's decision is final and binding."
  },
  {
    title: "4. Account Security",
    icon: UserCheck,
    content: "You are responsible for maintaining the security of your account and OTP. Bajiger Ludo will never ask for your password or OTP over phone or email."
  },
  {
    title: "5. Termination",
    icon: Gavel,
    content: "We reserve the right to terminate accounts that violate our terms, involve in fraudulent transactions, or engage in abusive behavior towards other players or staff."
  }
];

export default function TermsConditionsPage() {
  const router = useRouter();

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-xl bg-white/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-bold">Terms & Conditions</h1>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <Card className="p-6 bg-purple-500/5 border-purple-500/10">
          <p className="text-xs text-purple-400 font-bold uppercase tracking-widest mb-2">Last Updated: May 2026</p>
          <p className="text-sm text-gray-400 leading-relaxed italic">
            By using the Bajiger Ludo platform, you agree to abide by the following tactical protocols and financial regulations.
          </p>
        </Card>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-3"
            >
              <h2 className="flex items-center gap-3 text-lg font-bold text-white">
                <div className="p-2 rounded-lg bg-white/5 text-purple-400">
                  <section.icon className="w-4 h-4" />
                </div>
                {section.title}
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed pl-11">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <Card className="p-6 bg-white/[0.02] border-white/5 mt-10">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" /> 
            Legal Disclaimer
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Real money games involve financial risk. Please play responsibly. Bajiger Ludo is not responsible for any financial losses incurred due to game outcomes or network connectivity issues on the player's end. This platform is strictly for users 18 years and older.
          </p>
        </Card>
      </div>

      {/* Acceptance Note */}
      <div className="mt-12 text-center text-gray-600 px-8">
        <p className="text-[10px] uppercase font-bold tracking-widest mb-2">Tactical Agreement</p>
        <p className="text-xs italic leading-relaxed">
          Continuing to use our services implies your full acceptance of these terms.
        </p>
      </div>
    </div>
  );
}
