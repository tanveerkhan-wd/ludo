'use client';

import { useState, useEffect } from 'react';
import { Wallet, IndianRupee, Percent, ShieldCheck, Save, AlertCircle } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, cn } from '@/components/ui';

interface Props {
  settings: any;
  onSave: (data: any) => Promise<void>;
  saving: boolean;
}

export default function WalletTab({ settings, onSave, saving }: Props) {
  const [form, setForm] = useState({
    minWithdrawalAmount: 100,
    dailyWithdrawalLimit: 10000,
    withdrawalFeePercent: 0,
    withdrawalFeeFixed: 0,
    autoApprovalLimit: 0,
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (settings && !initialized) {
      setForm({
        minWithdrawalAmount: Number(settings.minWithdrawalAmount) ?? 100,
        dailyWithdrawalLimit: Number(settings.dailyWithdrawalLimit) ?? 10000,
        withdrawalFeePercent: Number(settings.withdrawalFeePercent) ?? 0,
        withdrawalFeeFixed: Number(settings.withdrawalFeeFixed) ?? 0,
        autoApprovalLimit: Number(settings.autoApprovalLimit) ?? 0,
      });
      setInitialized(true);
    }
  }, [settings, initialized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      minWithdrawalAmount: form.minWithdrawalAmount,
      dailyWithdrawalLimit: form.dailyWithdrawalLimit,
      withdrawalFeePercent: form.withdrawalFeePercent,
      withdrawalFeeFixed: form.withdrawalFeeFixed,
      autoApprovalLimit: form.autoApprovalLimit,
    });
  };

  const hasAutoApproval = form.autoApprovalLimit > 0;

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-500" />
              Withdrawal Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <IndianRupee className="w-3 h-3 inline mr-1" />
                  Minimum Withdrawal Amount
                </label>
                <Input
                  type="number"
                  step="1"
                  value={form.minWithdrawalAmount}
                  onChange={(e) => setForm({ ...form, minWithdrawalAmount: parseFloat(e.target.value) || 0 })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <IndianRupee className="w-3 h-3 inline mr-1" />
                  Daily Withdrawal Limit
                </label>
                <Input
                  type="number"
                  step="1"
                  value={form.dailyWithdrawalLimit}
                  onChange={(e) => setForm({ ...form, dailyWithdrawalLimit: parseFloat(e.target.value) || 0 })}
                  className="h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Percent className="w-5 h-5 text-orange-500" />
              Processing Fees
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Fee (% of withdrawal)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={form.withdrawalFeePercent}
                  onChange={(e) => setForm({ ...form, withdrawalFeePercent: parseFloat(e.target.value) || 0 })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Fixed Fee (₹)
                </label>
                <Input
                  type="number"
                  step="1"
                  value={form.withdrawalFeeFixed}
                  onChange={(e) => setForm({ ...form, withdrawalFeeFixed: parseFloat(e.target.value) || 0 })}
                  className="h-12"
                />
              </div>
            </div>
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-500/80">
                Fees are calculated as: <strong>percentage fee + fixed fee</strong>. For example, a ₹500 withdrawal with 2% + ₹5 fee would charge ₹15.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              Auto-Approval
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div>
                <p className="font-bold">Auto-Approval for Small Amounts</p>
                <p className="text-xs text-gray-500">Withdrawals below this amount are automatically approved.</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, autoApprovalLimit: hasAutoApproval ? 0 : 500 })}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative shrink-0',
                  hasAutoApproval ? 'bg-green-600' : 'bg-gray-700',
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                    hasAutoApproval ? 'left-7' : 'left-1',
                  )}
                />
              </button>
            </div>

            {hasAutoApproval && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Auto-Approval Threshold (₹)
                </label>
                <Input
                  type="number"
                  step="1"
                  value={form.autoApprovalLimit}
                  onChange={(e) => setForm({ ...form, autoApprovalLimit: parseFloat(e.target.value) || 0 })}
                  className="h-12"
                />
              </div>
            )}
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
            <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Fee Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">₹100 withdrawal</span>
              <span className="font-bold text-red-400">
                ₹{(100 * form.withdrawalFeePercent / 100 + form.withdrawalFeeFixed).toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">₹500 withdrawal</span>
              <span className="font-bold text-red-400">
                ₹{(500 * form.withdrawalFeePercent / 100 + form.withdrawalFeeFixed).toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">₹1000 withdrawal</span>
              <span className="font-bold text-red-400">
                ₹{(1000 * form.withdrawalFeePercent / 100 + form.withdrawalFeeFixed).toFixed(0)}
              </span>
            </div>
            <div className="pt-2 border-t border-white/5">
              <span className="text-xs text-gray-500">
                Auto-approval: <strong className={hasAutoApproval ? 'text-green-400' : 'text-gray-500'}>{hasAutoApproval ? `Yes (≤₹${form.autoApprovalLimit})` : 'Disabled'}</strong>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
