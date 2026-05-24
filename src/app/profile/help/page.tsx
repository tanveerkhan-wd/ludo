'use client';

import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MessageCircle, 
  Mail, 
  Phone, 
  HelpCircle, 
  ChevronDown,
  MessageSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button, Card } from '@/components/ui';

const faqs = [
  {
    question: "How do I deposit money?",
    answer: "You can deposit money by going to the 'Wallet' section and clicking 'Add Cash'. We support UPI and bank transfers."
  },
  {
    question: "Is my money safe?",
    answer: "Yes, all transactions are secured with industry-standard encryption. We use reliable payment gateways to ensure your funds are safe."
  },
  {
    question: "How long does withdrawal take?",
    answer: "Withdrawal requests are usually processed within 24 hours. Once processed, it depends on your bank/UPI provider, but usually hits your account instantly."
  },
  {
    question: "What is the referral commission?",
    answer: "You earn a 3% lifetime commission on the platform fee for every battle your referred friends play."
  },
  {
    question: "How do I complete KYC?",
    answer: "Go to your Profile > KYC Verification and upload the required documents (Aadhaar, PAN). It takes 24-48 hours for our team to verify."
  }
];

export default function HelpSupportPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const contactMethods = [
    { name: 'WhatsApp', icon: MessageCircle, detail: '+91 99999 99999', color: 'text-green-500', bg: 'bg-green-500/10' },
    { name: 'Email Support', icon: Mail, detail: 'support@bajigerludo.com', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Telegram', icon: MessageSquare, detail: '@BajigerLudoSupport', color: 'text-sky-500', bg: 'bg-sky-500/10' },
  ];

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
        <h1 className="text-2xl font-bold">Help & Support</h1>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 gap-4 mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-2 px-2">Contact Us</h2>
        {contactMethods.map((method, index) => (
          <motion.div
            key={method.name}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${method.bg} ${method.color}`}>
              <method.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{method.name}</p>
              <p className="font-bold text-white">{method.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4 px-2">Frequently Asked Questions</h2>
        {faqs.map((faq, index) => (
          <Card key={index} className="border-white/5 overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
            >
              <span className="font-semibold text-sm pr-4">{faq.question}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
            </button>
            {openFaq === index && (
              <div className="p-4 pt-0 text-sm text-gray-400 border-t border-white/5 mt-0 animate-in fade-in slide-in-from-top-1">
                <p className="pt-4 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-gray-600 px-8">
        <HelpCircle className="w-10 h-10 mx-auto mb-4 opacity-20" />
        <p className="text-xs italic leading-relaxed">
          Our support team is available 24/7 to help you with any tactical issues or settlement queries.
        </p>
      </div>
    </div>
  );
}
