import { useState, useEffect } from 'react';
import { CreditCard, Key, Globe, Webhook, Save, Eye, EyeOff, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Badge, cn } from '@/components/ui';

interface Props {
  settings: any;
  onSave: (data: any) => Promise<void>;
  saving: boolean;
}

export default function PaymentTab({ settings, onSave, saving }: Props) {
  const [form, setForm] = useState({
    razorpayKeyId: '',
    razorpayKeySecret: '',
    cashfreeAppId: '',
    cashfreeSecretKey: '',
    zapupiKey: '',
    activePaymentGateway: 'NONE', // NONE, RAZORPAY, CASHFREE, ZAPUPI
    paymentTestMode: true,
    webhookUrl: '',
  });
  const [initialized, setInitialized] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (settings && !initialized) {
      setForm({
        razorpayKeyId: settings.razorpayKeyId ?? '',
        razorpayKeySecret: settings.razorpayKeySecret ?? '',
        cashfreeAppId: settings.cashfreeAppId ?? '',
        cashfreeSecretKey: settings.cashfreeSecretKey ?? '',
        zapupiKey: settings.zapupiKey ?? '',
        activePaymentGateway: settings.activePaymentGateway ?? 'NONE',
        paymentTestMode: settings.paymentTestMode ?? true,
        webhookUrl: settings.webhookUrl ?? 'http://localhost:3000/api/webhooks/payment',
      });
      setInitialized(true);
    }
  }, [settings, initialized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      razorpayKeyId: form.razorpayKeyId || null,
      razorpayKeySecret: form.razorpayKeySecret || null,
      cashfreeAppId: form.cashfreeAppId || null,
      cashfreeSecretKey: form.cashfreeSecretKey || null,
      zapupiKey: form.zapupiKey || null,
      activePaymentGateway: form.activePaymentGateway,
      paymentTestMode: form.paymentTestMode,
      webhookUrl: form.webhookUrl,
    });
  };

  const toggleSecret = (field: string) => {
    setShowSecrets((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const SecretInput = ({ field, label, value, onChange }: { field: string; label: string; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <Input
          type={showSecrets[field] ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 pr-10"
        />
        <button
          type="button"
          onClick={() => toggleSecret(field)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
        >
          {showSecrets[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  const GatewaySelector = ({ value, label, id, color }: { value: string; label: string; id: string; color: 'red' | 'blue' | 'green' | 'yellow' }) => {
    const isActive = form.activePaymentGateway === value;
    
    const colors = {
      red: {
        border: "border-red-500",
        bg: "bg-red-500/10",
        iconBg: "bg-red-500/20",
        icon: "text-red-400",
        dot: "bg-red-500"
      },
      blue: {
        border: "border-blue-500",
        bg: "bg-blue-500/10",
        iconBg: "bg-blue-500/20",
        icon: "text-blue-400",
        dot: "bg-blue-500"
      },
      green: {
        border: "border-green-500",
        bg: "bg-green-500/10",
        iconBg: "bg-green-500/20",
        icon: "text-green-400",
        dot: "bg-green-500"
      },
      yellow: {
        border: "border-yellow-500",
        bg: "bg-yellow-500/10",
        iconBg: "bg-yellow-500/20",
        icon: "text-yellow-400",
        dot: "bg-yellow-500"
      }
    };

    const c = colors[color];

    return (
      <div 
        className={cn(
          "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
          isActive ? `${c.border} ${c.bg}` : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
        )}
        onClick={() => setForm({ ...form, activePaymentGateway: value })}
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isActive ? c.iconBg : "bg-white/5")}>
            {value === 'RAZORPAY' && <CreditCard className={cn("w-5 h-5", isActive ? c.icon : "text-gray-500")} />}
            {value === 'CASHFREE' && <CreditCard className={cn("w-5 h-5", isActive ? c.icon : "text-gray-500")} />}
            {value === 'ZAPUPI' && <Zap className={cn("w-5 h-5", isActive ? c.icon : "text-gray-500")} />}
            {value === 'NONE' && <ShieldCheck className={cn("w-5 h-5", isActive ? c.icon : "text-gray-500")} />}
          </div>
          <div>
            <p className="font-bold text-sm">{label}</p>
            <p className="text-[10px] text-gray-500">
              {isActive ? "Currently Active" : "Click to activate"}
            </p>
          </div>
        </div>
        <div className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
          isActive ? c.border : "border-gray-700"
        )}>
          {isActive && <div className={cn("w-2.5 h-2.5 rounded-full", c.dot)} />}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Active Gateway Selection */}
        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-500" />
              Active Payment Gateway
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GatewaySelector value="NONE" label="No Gateway (Manual Only)" id="none" color="red" />
              <GatewaySelector value="RAZORPAY" label="Razorpay" id="razorpay" color="blue" />
              <GatewaySelector value="CASHFREE" label="Cashfree" id="cashfree" color="green" />
              <GatewaySelector value="ZAPUPI" label="ZapUPI Gateway" id="zapupi" color="yellow" />
            </div>
          </CardContent>
        </Card>

        {/* ZapUPI Configuration */}
        <Card className={cn(
          "bg-[#121212]/40 backdrop-blur-xl border-white/5 transition-opacity",
          form.activePaymentGateway !== 'ZAPUPI' && "opacity-50"
        )}>
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              ZapUPI Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <SecretInput
                field="zapupiKey"
                label="Merchant API Key (ZAP_KEY)"
                value={form.zapupiKey}
                onChange={(v) => setForm({ ...form, zapupiKey: v })}
              />
              <p className="text-[10px] text-gray-500 italic">Get your ZAP_KEY from the ZapUPI Merchant Dashboard.</p>
            </div>
          </CardContent>
        </Card>

        {/* Razorpay Configuration */}
        <Card className={cn(
          "bg-[#121212]/40 backdrop-blur-xl border-white/5 transition-opacity",
          form.activePaymentGateway !== 'RAZORPAY' && "opacity-50"
        )}>
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
              Razorpay Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <Key className="w-3 h-3 inline mr-1" />
                  Key ID
                </label>
                <Input
                  value={form.razorpayKeyId}
                  onChange={(e) => setForm({ ...form, razorpayKeyId: e.target.value })}
                  placeholder="rzp_live_xxxxxxxxxxxx"
                  className="h-12"
                />
              </div>
              <SecretInput
                field="razorpayKeySecret"
                label="Key Secret"
                value={form.razorpayKeySecret}
                onChange={(v) => setForm({ ...form, razorpayKeySecret: v })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cashfree Configuration */}
        <Card className={cn(
          "bg-[#121212]/40 backdrop-blur-xl border-white/5 transition-opacity",
          form.activePaymentGateway !== 'CASHFREE' && "opacity-50"
        )}>
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-500" />
              Cashfree Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                  <Key className="w-3 h-3 inline mr-1" />
                  App ID
                </label>
                <Input
                  value={form.cashfreeAppId}
                  onChange={(e) => setForm({ ...form, cashfreeAppId: e.target.value })}
                  placeholder="CFxxxxxxxxxxxx"
                  className="h-12"
                />
              </div>
              <SecretInput
                field="cashfreeSecretKey"
                label="Secret Key"
                value={form.cashfreeSecretKey}
                onChange={(v) => setForm({ ...form, cashfreeSecretKey: v })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#121212]/40 backdrop-blur-xl border-white/5">
          <CardHeader className="border-white/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-500" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
              <div>
                <p className="font-bold">Test Mode</p>
                <p className="text-xs text-gray-500">When enabled, payments are processed in test/sandbox mode.</p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, paymentTestMode: !form.paymentTestMode })}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative shrink-0',
                  form.paymentTestMode ? 'bg-yellow-600' : 'bg-gray-700',
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 bg-white rounded-full transition-transform',
                    form.paymentTestMode ? 'left-7' : 'left-1',
                  )}
                />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                <Webhook className="w-3 h-3 inline mr-1" />
                Webhook URL
              </label>
              <Input
                value={form.webhookUrl}
                onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
                className="h-12 font-mono text-xs"
              />
              <p className="text-[10px] text-gray-600">Configure this URL in your payment gateway dashboard for receiving payment callbacks.</p>
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
            <CardTitle className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Status Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Active Gateway</span>
              <Badge variant={form.activePaymentGateway === 'NONE' ? 'destructive' : 'success'} className="font-bold">
                {form.activePaymentGateway}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Environment</span>
              <span className={cn('font-semibold text-xs', form.paymentTestMode ? 'text-yellow-400' : 'text-green-400')}>
                {form.paymentTestMode ? 'Test / Sandbox' : 'Production'}
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">ZapUPI</span>
              <span className={cn('font-semibold text-xs', form.zapupiKey ? 'text-green-400' : 'text-gray-500')}>
                {form.zapupiKey ? 'Configured' : 'Not Set'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Razorpay</span>
              <span className={cn('font-semibold text-xs', form.razorpayKeyId ? 'text-green-400' : 'text-gray-500')}>
                {form.razorpayKeyId ? 'Configured' : 'Not Set'}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Cashfree</span>
              <span className={cn('font-semibold text-xs', form.cashfreeAppId ? 'text-green-400' : 'text-gray-500')}>
                {form.cashfreeAppId ? 'Configured' : 'Not Set'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}

function Separator({ className }: { className?: string }) {
  return <div className={cn("h-[1px] w-full bg-white/5", className)} />;
}
