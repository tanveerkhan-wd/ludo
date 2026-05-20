'use client';

import { useState, useEffect } from 'react';
import { Globe, Mail, Phone, Wrench, Save, AlertCircle } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, cn } from '@/components/ui';
import { toast } from 'sonner';

interface Props {
  settings: any;
  onSave: (data: any) => Promise<void>;
  saving: boolean;
}

export default function GeneralTab({ settings, onSave, saving }: Props) {
  const [form, setForm] = useState({
    platformName: '',
    tagline: '',
    logoUrl: '',
    contactEmail: '',
    supportWhatsApp: '',
    maintenanceMode: false,
  });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (settings && !initialized) {
      setForm({
        platformName: settings.platformName ?? 'Bajiger Ludo',
        tagline: settings.tagline ?? 'Play. Compete. Earn.',
        logoUrl: settings.logoUrl ?? '',
        contactEmail: settings.contactEmail ?? 'support@bajigerludo.com',
        supportWhatsApp: settings.supportWhatsApp ?? '+919999999999',
        maintenanceMode: settings.maintenanceMode ?? false,
      });
      setInitialized(true);
    }
  }, [settings, initialized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      platformName: form.platformName,
      tagline: form.tagline,
      logoUrl: form.logoUrl || null,
      contactEmail: form.contactEmail,
      supportWhatsApp: form.supportWhatsApp,
      maintenanceMode: form.maintenanceMode,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-500" />
              Platform Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Platform Name</label>
                <Input
                  value={form.platformName}
                  onChange={(e) => setForm({ ...form, platformName: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Tagline</label>
                <Input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="h-12"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Logo URL</label>
              <Input
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="h-12"
              />
              <p className="text-[10px] text-gray-600 mt-1">Upload your logo and paste the public URL here.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-500" />
              Contact & Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <Mail className="w-3 h-3 inline mr-1" />
                  Contact Email
                </label>
                <Input
                  type="email"
                  value={form.contactEmail}
                  onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <Phone className="w-3 h-3 inline mr-1" />
                  WhatsApp Number
                </label>
                <Input
                  value={form.supportWhatsApp}
                  onChange={(e) => setForm({ ...form, supportWhatsApp: e.target.value })}
                  placeholder="+919999999999"
                  className="h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-500" />
              Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div>
                <p className="font-bold">Maintenance Mode</p>
                <p className="text-xs text-gray-500">When enabled, only admins can access the platform.</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, maintenanceMode: !form.maintenanceMode })}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative shrink-0',
                  form.maintenanceMode ? 'bg-orange-600' : 'bg-gray-700',
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                    form.maintenanceMode ? 'left-7' : 'left-1',
                  )}
                />
              </button>
            </div>

            {form.maintenanceMode && (
              <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl flex gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-xs text-orange-500/80">Maintenance mode is active. All non-admin users will be blocked from accessing the platform.</p>
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
            <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Quick Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Status</span>
              <span className="flex items-center gap-1.5 text-green-400 font-semibold text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                Live
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Maintenance</span>
              <span className={cn('font-semibold text-xs', form.maintenanceMode ? 'text-orange-400' : 'text-gray-500')}>
                {form.maintenanceMode ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
