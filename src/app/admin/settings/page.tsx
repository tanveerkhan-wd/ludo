'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, SlidersHorizontal, Wallet, Gamepad2, CreditCard, Shield, Skeleton as SkeletonIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent, Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import { toast } from 'sonner';
import GeneralTab from './components/GeneralTab';
import ReferralTab from './components/ReferralTab';
import WalletTab from './components/WalletTab';
import BattleTab from './components/BattleTab';
import PaymentTab from './components/PaymentTab';
import SecurityTab from './components/SecurityTab';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings');
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(updates: Record<string, any>) {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to save');
      const data = await res.json();
      setSettings(data.settings);
      toast.success('Settings saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded-lg mt-2" />
        </div>
        <Skeleton className="h-12 w-full max-w-xl rounded-xl" />
        <Skeleton className="h-[500px] w-full rounded-3xl" />
      </div>
    );
  }

  const tabs = [
    { value: 'general', label: 'General', icon: SettingsIcon },
    { value: 'referral', label: 'Referral', icon: SlidersHorizontal },
    { value: 'wallet', label: 'Wallet & Withdrawal', icon: Wallet },
    { value: 'battle', label: 'Battle & Game', icon: Gamepad2 },
    { value: 'payment', label: 'Payment Gateway', icon: CreditCard },
    { value: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your platform configuration across all modules.</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <div className="overflow-x-auto -mx-1 px-1">
          <TabsList className="mb-8 min-w-max">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2 whitespace-nowrap">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="general">
          <GeneralTab settings={settings} onSave={handleSave} saving={saving} />
        </TabsContent>
        <TabsContent value="referral">
          <ReferralTab settings={settings} onSave={handleSave} saving={saving} />
        </TabsContent>
        <TabsContent value="wallet">
          <WalletTab settings={settings} onSave={handleSave} saving={saving} />
        </TabsContent>
        <TabsContent value="battle">
          <BattleTab settings={settings} onSave={handleSave} saving={saving} />
        </TabsContent>
        <TabsContent value="payment">
          <PaymentTab settings={settings} onSave={handleSave} saving={saving} />
        </TabsContent>
        <TabsContent value="security">
          <SecurityTab settings={settings} onSave={handleSave} saving={saving} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
