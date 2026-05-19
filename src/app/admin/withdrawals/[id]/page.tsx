'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Wallet, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  AlertCircle,
  Building,
  Smartphone,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  Badge, 
  Skeleton,
  Input,
  cn
} from '@/components/ui';
import { toast } from 'sonner';

export default function WithdrawalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [withdrawal, setWithdrawal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');

  const fetchWithdrawal = async () => {
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}`);
      if (res.ok) {
        setWithdrawal(await res.json());
      } else {
        toast.error('Failed to load withdrawal details');
        router.push('/admin/withdrawals');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchWithdrawal();
  }, [id]);

  const handleAction = async (status: string) => {
    if (status === 'REJECTED' && !rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, rejectionReason, notes })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Withdrawal marked as ${status}`);
        fetchWithdrawal();
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="w-48 h-10 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-[2rem]" />
          <Skeleton className="lg:col-span-1 h-[400px] rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (!withdrawal) return null;

  const isFinalState = ['REJECTED', 'PROCESSED', 'FAILED'].includes(withdrawal.status);
  const parsedBankDetails = withdrawal.bankDetails ? JSON.parse(withdrawal.bankDetails) : null;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/admin/withdrawals')}
          className="w-12 h-12 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            {withdrawal.withdrawalId}
            <Badge 
              variant={
                withdrawal.status === 'PENDING' ? 'warning' :
                withdrawal.status === 'APPROVED' ? 'info' :
                withdrawal.status === 'PROCESSED' ? 'success' : 'destructive'
              } 
              className="text-xs px-3 h-7 rounded-lg uppercase tracking-widest font-bold"
            >
              {withdrawal.status}
            </Badge>
          </h1>
          <p className="text-gray-400 mt-1 uppercase tracking-widest text-xs font-semibold">
            Requested on {new Date(withdrawal.requestedAt).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* User Information */}
          <Card>
            <CardHeader className="border-b border-white/5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-blue-400" />
                Player Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Player Name</p>
                <p className="font-bold text-lg">{withdrawal.user.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Registered Phone</p>
                <p className="font-bold text-lg">{withdrawal.user.phone}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Current Wallet Balance</p>
                <p className="font-bold text-lg text-green-500">₹{withdrawal.user.walletBalance}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">KYC Status</p>
                <Badge variant={withdrawal.user.kycStatus === 'Verified' ? 'success' : 'warning'} className="rounded-lg">
                  {withdrawal.user.kycStatus}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card className="bg-gradient-to-br from-[#121212] to-purple-900/10 border-purple-500/10">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wallet className="w-5 h-5 text-purple-400" />
                Target Destination
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-8">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Requested Amount</p>
                <p className="text-5xl font-bold text-white tracking-tighter">₹{withdrawal.amount}</p>
              </div>

              <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  {withdrawal.preferredMethod === 'UPI' ? <Smartphone className="w-5 h-5 text-blue-400" /> : <Building className="w-5 h-5 text-blue-400" />}
                  <span className="font-bold text-lg uppercase tracking-widest">{withdrawal.preferredMethod} TRANSFER</span>
                </div>

                {withdrawal.preferredMethod === 'UPI' ? (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">UPI Virtual Payment Address</p>
                    <code className="text-xl font-mono text-white bg-white/5 px-4 py-2 rounded-xl border border-white/10 select-all block break-all">
                      {withdrawal.upiId}
                    </code>
                  </div>
                ) : parsedBankDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Account Name</p>
                      <p className="font-bold text-lg">{parsedBankDetails.accountHolderName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Account Number</p>
                      <code className="font-mono text-lg select-all">{parsedBankDetails.accountNumber}</code>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">IFSC Code</p>
                      <code className="font-mono text-lg select-all">{parsedBankDetails.ifscCode}</code>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-500 font-bold">Error: Payment details missing or corrupted.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="lg:col-span-1 space-y-8">
          <Card className={cn(
            "border-2 transition-colors",
            withdrawal.status === 'PENDING' ? "border-yellow-500/20 bg-yellow-500/5" :
            withdrawal.status === 'APPROVED' ? "border-blue-500/20 bg-blue-500/5" :
            withdrawal.status === 'PROCESSED' ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"
          )}>
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                Executive Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {!isFinalState ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Internal Notes (Optional)</label>
                    <Input 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      placeholder="e.g. Transaction Ref #123"
                      className="bg-black/20"
                    />
                  </div>

                  {withdrawal.status === 'PENDING' && (
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="premium" 
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]"
                        onClick={() => handleAction('APPROVED')}
                        disabled={actionLoading}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => {
                          const reason = window.prompt('Enter reason for rejection (Required):');
                          if (reason) {
                            setRejectionReason(reason);
                            // We use setTimeout to allow state update before firing API if we changed flow, 
                            // but simpler to just call API directly here
                            handleRejectDirectly(reason);
                          }
                        }}
                        disabled={actionLoading}
                      >
                        <Ban className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </div>
                  )}

                  {withdrawal.status === 'APPROVED' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                        <p className="text-xs text-yellow-500 font-semibold mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" /> Manual Payment Required
                        </p>
                        <p className="text-[10px] text-yellow-500/80 leading-relaxed">
                          Please transfer ₹{withdrawal.amount} to the user's {withdrawal.preferredMethod} account manually. Once transfer is successful, click the button below to close this request.
                        </p>
                      </div>
                      <Button 
                        variant="premium" 
                        className="w-full h-14 text-base bg-gradient-to-r from-green-600 to-emerald-600 shadow-[0_0_20px_rgba(22,163,74,0.3)]"
                        onClick={() => handleAction('PROCESSED')}
                        disabled={actionLoading}
                      >
                        <CheckCircle2 className="w-5 h-5 mr-2" /> Mark as Paid (Processed)
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4 text-center py-4">
                  {withdrawal.status === 'PROCESSED' && (
                    <>
                      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                      <p className="font-bold text-green-500 text-lg uppercase tracking-widest">Payout Processed</p>
                    </>
                  )}
                  {withdrawal.status === 'REJECTED' && (
                    <>
                      <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                      <p className="font-bold text-red-500 text-lg uppercase tracking-widest">Request Rejected</p>
                      <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20 mt-4 text-left">
                        <p className="text-[10px] font-semibold text-red-400 uppercase tracking-widest mb-1">Reason</p>
                        <p className="text-sm font-semibold">{withdrawal.rejectionReason}</p>
                      </div>
                    </>
                  )}
                  
                  {withdrawal.processedBy && (
                    <p className="text-xs text-gray-500 mt-4">
                      Action performed by <span className="text-white font-bold">{withdrawal.processedBy.name}</span> on {new Date(withdrawal.processedAt).toLocaleString()}
                    </p>
                  )}
                  {withdrawal.notes && (
                    <div className="bg-white/5 p-3 rounded-lg border border-white/10 mt-4 text-left">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Admin Notes</p>
                      <p className="text-sm">{withdrawal.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  // Helper for direct reject with prompt
  async function handleRejectDirectly(reason: string) {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/withdrawals/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', rejectionReason: reason, notes })
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success(`Withdrawal rejected and funds refunded to user`);
        fetchWithdrawal();
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setActionLoading(false);
    }
  }
}
