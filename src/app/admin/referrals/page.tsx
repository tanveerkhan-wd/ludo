'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  BarChart3, 
  History, 
  Save, 
  ShieldCheck, 
  Users, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Input, 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
  Badge,
  Skeleton,
  cn
} from '@/components/ui';
import { toast } from 'sonner';

export default function AdminReferralPage() {
  const [settings, setSettings] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, statsRes] = await Promise.all([
          fetch('/api/admin/referral/settings'),
          fetch('/api/admin/referral/stats')
        ]);
        
        setSettings(await settingsRes.json());
        setStats(await statsRes.json());
      } catch (error) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/referral/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast.success('Settings updated successfully');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referral Management</h1>
          <p className="text-gray-500 mt-1">Configure and monitor the platform's referral ecosystem.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={settings?.referralEnabled ? 'success' : 'destructive'} className="h-8 px-4 rounded-xl">
            {settings?.referralEnabled ? 'System Active' : 'System Disabled'}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="config" className="gap-2">
            <Settings className="w-4 h-4" /> Configuration
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="w-4 h-4" /> Statistics
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" /> Global History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-500" />
                  Program Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div>
                    <p className="font-bold">Enable Referral Program</p>
                    <p className="text-xs text-gray-500">Allow users to earn commissions from referrals.</p>
                  </div>
                  <button 
                    onClick={() => setSettings({ ...settings, referralEnabled: !settings.referralEnabled })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      settings?.referralEnabled ? "bg-purple-600" : "bg-gray-700"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                      settings?.referralEnabled ? "left-7" : "left-1"
                    )} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Commission Percentage (%)</label>
                    <Input 
                      type="number"
                      value={settings?.referralPercent || 0}
                      onChange={(e) => setSettings({ ...settings, referralPercent: parseFloat(e.target.value) })}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Min Entry Fee for Commission</label>
                    <Input 
                      type="number"
                      value={settings?.minEntryFee || 0}
                      onChange={(e) => setSettings({ ...settings, minEntryFee: parseFloat(e.target.value) })}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl flex gap-4">
                  <AlertCircle className="w-6 h-6 text-yellow-500 shrink-0" />
                  <div className="text-xs text-yellow-500/80 leading-relaxed">
                    <p className="font-bold mb-1 uppercase">Strategic Note:</p>
                    Commission is deducted from the platform fee (rake). Currently, platform fee is calculated globally. Ensure the commission percentage does not exceed your platform rake to maintain profitability.
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full sm:w-auto px-12 h-12 rounded-2xl gap-2" 
                    variant="premium"
                    onClick={handleSaveSettings}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Configuration</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Quick Audit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Total Paid Out</span>
                    <span className="font-bold">₹{stats?.totalPaid || 0}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Active Referrers</span>
                    <span className="font-bold text-purple-400">{stats?.topReferrers?.length || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Total Paid</p>
                <p className="text-3xl font-bold text-green-500">₹{stats?.totalPaid || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Conversion Rate</p>
                <p className="text-3xl font-bold text-blue-400">{stats?.conversionRate?.toFixed(1) || 0}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Top Referrer Earning</p>
                <p className="text-3xl font-bold text-yellow-500">₹{stats?.topReferrers?.[0]?.totalReferralEarnings || 0}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Leaderboard (Top Referrers)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                      <th className="px-4 py-4">User</th>
                      <th className="px-4 py-4">Phone</th>
                      <th className="px-4 py-4 text-center">Referrals</th>
                      <th className="px-4 py-4 text-right">Total Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stats?.topReferrers?.map((u: any) => (
                      <tr key={u.id} className="hover:bg-white/[0.02]">
                        <td className="px-4 py-4 font-bold">{u.name}</td>
                        <td className="px-4 py-4 text-gray-400 text-sm">{u.phone}</td>
                        <td className="px-4 py-4 text-center font-semibold">{u._count.referrals}</td>
                        <td className="px-4 py-4 text-right text-green-500 font-bold">₹{u.totalReferralEarnings}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Global Referral Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-12 text-center opacity-30">
                <History className="w-12 h-12 mx-auto mb-4" />
                <p className="font-semibold uppercase tracking-widest text-sm">Real-time log integration pending...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
