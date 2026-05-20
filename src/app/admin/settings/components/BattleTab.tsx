'use client';

import { useState, useEffect } from 'react';
import { Gamepad2, IndianRupee, Percent, Clock, Timer, Save, AlertCircle } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, cn } from '@/components/ui';

interface Props {
  settings: any;
  onSave: (data: any) => Promise<void>;
  saving: boolean;
}

export default function BattleTab({ settings, onSave, saving }: Props) {
  const [form, setForm] = useState({
    platformFeePercent: 10,
    minBattleEntry: 10,
    maxBattleEntry: 10000,
    autoCancelMinutes: 15,
    resultSubmitWindowMinutes: 30,
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (settings && !initialized) {
      setForm({
        platformFeePercent: Number(settings.platformFeePercent) ?? 10,
        minBattleEntry: Number(settings.minBattleEntry) ?? 10,
        maxBattleEntry: Number(settings.maxBattleEntry) ?? 10000,
        autoCancelMinutes: settings.autoCancelMinutes ?? 15,
        resultSubmitWindowMinutes: settings.resultSubmitWindowMinutes ?? 30,
      });
      setInitialized(true);
    }
  }, [settings, initialized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      platformFeePercent: form.platformFeePercent,
      minBattleEntry: form.minBattleEntry,
      maxBattleEntry: form.maxBattleEntry,
      autoCancelMinutes: form.autoCancelMinutes,
      resultSubmitWindowMinutes: form.resultSubmitWindowMinutes,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Percent className="w-5 h-5 text-purple-500" />
              Platform Commission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <Percent className="w-3 h-3 inline mr-1" />
                  Platform Rake
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.1"
                    value={form.platformFeePercent}
                    onChange={(e) => setForm({ ...form, platformFeePercent: parseFloat(e.target.value) || 0 })}
                    className="h-12 pr-8"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-semibold">%</span>
                </div>
                <p className="text-[10px] text-gray-600">Commission deducted from each battle entry fee.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-green-500" />
              Entry Fee Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <IndianRupee className="w-3 h-3 inline mr-1" />
                  Minimum Entry Fee
                </label>
                <Input
                  type="number"
                  step="1"
                  value={form.minBattleEntry}
                  onChange={(e) => setForm({ ...form, minBattleEntry: parseFloat(e.target.value) || 0 })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <IndianRupee className="w-3 h-3 inline mr-1" />
                  Maximum Entry Fee
                </label>
                <Input
                  type="number"
                  step="1"
                  value={form.maxBattleEntry}
                  onChange={(e) => setForm({ ...form, maxBattleEntry: parseFloat(e.target.value) || 0 })}
                  className="h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Time Constraints
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <Timer className="w-3 h-3 inline mr-1" />
                  Auto-Cancel After (minutes)
                </label>
                <Input
                  type="number"
                  step="1"
                  value={form.autoCancelMinutes}
                  onChange={(e) => setForm({ ...form, autoCancelMinutes: parseInt(e.target.value) || 0 })}
                  className="h-12"
                />
                <p className="text-[10px] text-gray-600">Battle auto-cancels if no opponent joins within this time.</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Result Submission Window (minutes)
                </label>
                <Input
                  type="number"
                  step="1"
                  value={form.resultSubmitWindowMinutes}
                  onChange={(e) => setForm({ ...form, resultSubmitWindowMinutes: parseInt(e.target.value) || 0 })}
                  className="h-12"
                />
                <p className="text-[10px] text-gray-600">Time allowed for players to submit battle results.</p>
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
            <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Rake Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">₹10 entry</span>
              <span className="font-bold text-purple-400">₹{(10 * form.platformFeePercent / 100).toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">₹50 entry</span>
              <span className="font-bold text-purple-400">₹{(50 * form.platformFeePercent / 100).toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">₹100 entry</span>
              <span className="font-bold text-purple-400">₹{(100 * form.platformFeePercent / 100).toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">₹500 entry</span>
              <span className="font-bold text-purple-400">₹{(500 * form.platformFeePercent / 100).toFixed(0)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
