'use client';

import { useState, useEffect } from 'react';
import { Users, Percent, IndianRupee, Save, AlertCircle } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, cn } from '@/components/ui';

interface Props {
  settings: any;
  onSave: (data: any) => Promise<void>;
  saving: boolean;
}

export default function ReferralTab({ settings, onSave, saving }: Props) {
  const [form, setForm] = useState({
    referralEnabled: false,
    referralPercent: 3,
    minEntryFee: 0,
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (settings && !initialized) {
      setForm({
        referralEnabled: settings.referralEnabled ?? true,
        referralPercent: Number(settings.referralPercent) ?? 3,
        minEntryFee: Number(settings.minEntryFee) ?? 0,
      });
      setInitialized(true);
    }
  }, [settings, initialized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      referralEnabled: form.referralEnabled,
      referralPercent: form.referralPercent,
      minEntryFee: form.minEntryFee,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Referral Program Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div>
                <p className="font-bold">Enable Referral Program</p>
                <p className="text-xs text-gray-500">Allow users to earn commissions from referrals.</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, referralEnabled: !form.referralEnabled })}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative shrink-0',
                  form.referralEnabled ? 'bg-purple-600' : 'bg-gray-700',
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                    form.referralEnabled ? 'left-7' : 'left-1',
                  )}
                />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <Percent className="w-3 h-3 inline mr-1" />
                  Commission Percentage
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.referralPercent}
                  onChange={(e) => setForm({ ...form, referralPercent: parseFloat(e.target.value) || 0 })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <IndianRupee className="w-3 h-3 inline mr-1" />
                  Min Entry Fee for Commission
                </label>
                <Input
                  type="number"
                  step="1"
                  value={form.minEntryFee}
                  onChange={(e) => setForm({ ...form, minEntryFee: parseFloat(e.target.value) || 0 })}
                  className="h-12"
                />
              </div>
            </div>

            <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-500/80 leading-relaxed">
                <p className="font-bold mb-1 uppercase">Strategic Note:</p>
                Commission is deducted from the platform fee (rake). Ensure the commission percentage does not exceed your platform rake to maintain profitability.
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="px-12 h-12 rounded-2xl gap-2" variant="premium" disabled={saving}>
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Status</span>
              <span className={cn('font-semibold text-xs', form.referralEnabled ? 'text-green-400' : 'text-red-400')}>
                {form.referralEnabled ? 'Active' : 'Disabled'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Commission</span>
              <span className="font-bold text-purple-400">{form.referralPercent}%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Min Entry Fee</span>
              <span className="font-bold">₹{form.minEntryFee}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
