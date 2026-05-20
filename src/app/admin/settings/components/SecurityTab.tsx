'use client';

import { useState, useEffect } from 'react';
import { Shield, Timer, Gauge, LogOut, UserCheck, Save, AlertCircle } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, cn } from '@/components/ui';

interface Props {
  settings: any;
  onSave: (data: any) => Promise<void>;
  saving: boolean;
}

export default function SecurityTab({ settings, onSave, saving }: Props) {
  const [form, setForm] = useState({
    otpExpiryMinutes: 5,
    rateLimitPerMinute: 10,
    sessionTimeoutMinutes: 60,
    kycRequired: false,
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (settings && !initialized) {
      setForm({
        otpExpiryMinutes: settings.otpExpiryMinutes ?? 5,
        rateLimitPerMinute: settings.rateLimitPerMinute ?? 10,
        sessionTimeoutMinutes: settings.sessionTimeoutMinutes ?? 60,
        kycRequired: settings.kycRequired ?? false,
      });
      setInitialized(true);
    }
  }, [settings, initialized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      otpExpiryMinutes: form.otpExpiryMinutes,
      rateLimitPerMinute: form.rateLimitPerMinute,
      sessionTimeoutMinutes: form.sessionTimeoutMinutes,
      kycRequired: form.kycRequired,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Timer className="w-5 h-5 text-purple-500" />
              OTP & Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  OTP Expiry Time (minutes)
                </label>
                <Input
                  type="number"
                  step="1"
                  value={form.otpExpiryMinutes}
                  onChange={(e) => setForm({ ...form, otpExpiryMinutes: parseInt(e.target.value) || 1 })}
                  className="h-12"
                />
                <p className="text-[10px] text-gray-600">How long an OTP remains valid before expiring.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <LogOut className="w-3 h-3 inline mr-1" />
                  Session Timeout (minutes)
                </label>
                <Input
                  type="number"
                  step="1"
                  value={form.sessionTimeoutMinutes}
                  onChange={(e) => setForm({ ...form, sessionTimeoutMinutes: parseInt(e.target.value) || 1 })}
                  className="h-12"
                />
                <p className="text-[10px] text-gray-600">User session expiry after inactivity.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Gauge className="w-5 h-5 text-orange-500" />
              Rate Limiting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  Max Requests Per Minute
                </label>
                <Input
                  type="number"
                  step="1"
                  value={form.rateLimitPerMinute}
                  onChange={(e) => setForm({ ...form, rateLimitPerMinute: parseInt(e.target.value) || 1 })}
                  className="h-12"
                />
                <p className="text-[10px] text-gray-600">Maximum API requests allowed per minute per user.</p>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-500/80 leading-relaxed">
                <p className="font-bold mb-1 uppercase">Security Advisory:</p>
                Setting this too high may expose the API to brute-force attacks. Recommended: 10-20 requests per minute per user.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500" />
              KYC Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div>
                <p className="font-bold">Require KYC Verification</p>
                <p className="text-xs text-gray-500">Users must complete KYC before participating in battles or withdrawing funds.</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, kycRequired: !form.kycRequired })}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative shrink-0',
                  form.kycRequired ? 'bg-blue-600' : 'bg-gray-700',
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                    form.kycRequired ? 'left-7' : 'left-1',
                  )}
                />
              </button>
            </div>

            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-500/80">
                When enabled, users with KYC status other than &quot;Verified&quot; will be restricted from creating battles and making withdrawals.
              </p>
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
            <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Security Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">OTP Expiry</span>
              <span className="font-bold">{form.otpExpiryMinutes} min</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Rate Limit</span>
              <span className="font-bold">{form.rateLimitPerMinute}/min</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Session</span>
              <span className="font-bold">{form.sessionTimeoutMinutes} min</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">KYC Required</span>
              <span className={cn('font-semibold text-xs', form.kycRequired ? 'text-blue-400' : 'text-gray-500')}>
                {form.kycRequired ? 'Yes' : 'No'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
