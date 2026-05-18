'use client';

import { useState } from 'react';
import { IBattle } from '@/types/battle';
import { 
  Badge, 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Separator,
  cn,
  Input,
  Select
} from '@/components/ui';
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle2, 
  Swords, 
  User, 
  Wallet, 
  Clock, 
  ShieldAlert, 
  ExternalLink,
  Trophy,
  History,
  FileText,
  AlertTriangle,
  Loader2,
  Calendar,
  Smartphone,
  Hash,
  IndianRupee,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface BattleDetailClientProps {
  battle: IBattle;
}

export default function BattleDetailClient({ battle: initialBattle }: BattleDetailClientProps) {
  const [battle, setBattle] = useState<IBattle>(initialBattle);
  const [resolving, setResolving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [resolutionData, setResolutionData] = useState({
    winnerId: battle.winnerId || '',
    status: (battle.status === 'CANCELLED' ? 'CANCELLED' : 'COMPLETED') as 'COMPLETED' | 'CANCELLED',
    adminNotes: battle.adminNotes || '',
  });
  const router = useRouter();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const refreshData = async () => {
    try {
      const res = await fetch(`/api/admin/battles/${battle.id}`);
      if (res.ok) {
        const data = await res.json();
        setBattle(data);
      }
    } catch (err) {
      console.error('Failed to refresh data', err);
    }
  };

  const handleResolve = async () => {
    if (resolutionData.status === 'COMPLETED' && !resolutionData.winnerId) {
      toast.error('Please select a winner');
      return;
    }

    setResolving(true);
    try {
      const res = await fetch(`/api/admin/battles/${battle.id}/resolve-dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolutionData),
      });

      if (res.ok) {
        toast.success('Battle resolution saved successfully');
        await refreshData();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to resolve battle');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setResolving(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'OPEN': return 'secondary';
      case 'FULL': return 'warning';
      case 'IN_PROGRESS': return 'default';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'destructive';
      case 'DISPUTED': return 'destructive';
      default: return 'secondary';
    }
  };

  const canResolve = ['DISPUTED', 'IN_PROGRESS', 'FULL', 'OPEN'].includes(battle.status);

  return (
    <div className="space-y-6 pb-20">
      {/* Breadcrumbs & Navigation */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <button onClick={() => router.push('/admin/battles')} className="hover:text-purple-400 transition-colors">Battles</button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-300">Battle Details</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full w-12 h-12"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">#{battle.battleId}</h1>
                <Badge variant={getStatusVariant(battle.status)} className="px-3 py-1 uppercase tracking-wider text-[10px] font-bold">
                  {battle.status}
                </Badge>
              </div>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Created on {new Date(battle.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => copyToClipboard(battle.battleId, 'Battle ID')}
            >
              <Hash className="w-4 h-4" /> Copy ID
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
              onClick={() => setActiveTab('dispute')}
            >
              <ShieldAlert className="w-4 h-4" /> Resolve Dispute
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <div className="sticky top-0 z-10 bg-[#0a0a0a] pt-2">
          <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-white/5 border-white/5 no-scrollbar">
            <TabsTrigger value="overview" className="gap-2 py-2.5 px-6"><FileText className="w-4 h-4" /> Overview</TabsTrigger>
            <TabsTrigger value="players" className="gap-2 py-2.5 px-6"><User className="w-4 h-4" /> Players</TabsTrigger>
            <TabsTrigger value="proofs" className="gap-2 py-2.5 px-6"><ShieldAlert className="w-4 h-4" /> Game Proofs</TabsTrigger>
            <TabsTrigger value="settlement" className="gap-2 py-2.5 px-6"><IndianRupee className="w-4 h-4" /> Settlement</TabsTrigger>
            <TabsTrigger value="dispute" className="gap-2 py-2.5 px-6"><AlertTriangle className="w-4 h-4" /> Dispute & Admin</TabsTrigger>
            <TabsTrigger value="activity" className="gap-2 py-2.5 px-6"><History className="w-4 h-4" /> Activity Log</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                  <Clock className="w-4 h-4 text-purple-400" /> Match Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Room Code</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-white/5 px-3 py-1 rounded text-purple-400 font-mono text-sm border border-white/5">
                      {battle.roomCode}
                    </code>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-500 hover:text-white" onClick={() => copyToClipboard(battle.roomCode, 'Room Code')}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Platform Fee</span>
                  <span className="font-bold text-red-400">₹{battle.platformFee}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Prize Pool</span>
                  <span className="font-bold text-green-500 text-lg">₹{battle.prizeAmount}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2 uppercase tracking-widest">
                  <Swords className="w-4 h-4 text-purple-400" /> Live Matchup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center justify-around gap-8 py-4">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="relative">
                      <Avatar className="w-20 h-20 border-2 border-blue-500/50 p-1">
                        <AvatarImage src={battle.creator?.avatar} />
                        <AvatarFallback>{battle.creator?.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white uppercase tracking-tighter">Creator</div>
                    </div>
                    <div>
                      <p className="font-bold text-lg">{battle.creator?.name}</p>
                      <p className="text-sm text-gray-500 font-mono">+91 {battle.creator?.phone}</p>
                    </div>
                    {battle.winnerId === battle.creatorId && (
                       <Badge variant="success" className="gap-1.5 py-1 px-3"><Trophy className="w-3.5 h-3.5" /> WINNER</Badge>
                    )}
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase italic">VS</span>
                    </div>
                    <div className="h-10 w-[2px] bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block"></div>
                  </div>

                  <div className="flex flex-col items-center text-center space-y-3">
                    {battle.opponent ? (
                      <>
                        <div className="relative">
                          <Avatar className="w-20 h-20 border-2 border-red-500/50 p-1">
                            <AvatarImage src={battle.opponent.avatar} />
                            <AvatarFallback>{battle.opponent.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -top-1 -right-1 bg-red-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white uppercase tracking-tighter">Opponent</div>
                        </div>
                        <div>
                          <p className="font-bold text-lg">{battle.opponent.name}</p>
                          <p className="text-sm text-gray-500 font-mono">+91 {battle.opponent.phone}</p>
                        </div>
                        {battle.winnerId === battle.opponentId && (
                           <Badge variant="success" className="gap-1.5 py-1 px-3"><Trophy className="w-3.5 h-3.5" /> WINNER</Badge>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center opacity-50 space-y-3">
                        <div className="w-20 h-20 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                          <Clock className="w-8 h-8 text-gray-500 animate-pulse" />
                        </div>
                        <p className="text-sm text-gray-500 italic">Waiting for opponent...</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             {[
               { label: 'Entry Fee', value: `₹${battle.entryFee}`, icon: IndianRupee, color: 'text-blue-400', bg: 'bg-blue-400/10' },
               { label: 'Platform Fee', value: `₹${battle.platformFee}`, icon: Wallet, color: 'text-red-400', bg: 'bg-red-400/10' },
               { label: 'Win Amount', value: `₹${battle.prizeAmount}`, icon: Trophy, color: 'text-green-400', bg: 'bg-green-400/10' },
               { label: 'Match Status', value: battle.status, icon: AlertTriangle, color: 'text-purple-400', bg: 'bg-purple-400/10' },
             ].map((item, i) => (
               <div key={i} className="bg-[#121212] border border-white/5 p-5 rounded-3xl flex items-center gap-4">
                 <div className={cn("p-3 rounded-2xl", item.bg, item.color)}>
                   <item.icon className="w-5 h-5" />
                 </div>
                 <div>
                   <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{item.label}</p>
                   <p className="text-xl font-bold">{item.value}</p>
                 </div>
               </div>
             ))}
          </div>
        </TabsContent>

        {/* Tab 2: Players */}
        <TabsContent value="players" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PlayerDetailCard title="Creator Profile" user={battle.creator} />
            <PlayerDetailCard title="Opponent Profile" user={battle.opponent} />
          </div>
        </TabsContent>

        {/* Tab 3: Game Proofs */}
        <TabsContent value="proofs" className="mt-6">
           <Card>
             <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-yellow-500" /> Game Verification Proofs
                    </CardTitle>
                    <CardDescription>Submitted by the players for match validation.</CardDescription>
                  </div>
                  {battle.proofSubmittedBy && (
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-bold">Submitted By</p>
                      <p className="text-sm font-semibold">{battle.proofSubmittedBy.name}</p>
                    </div>
                  )}
                </div>
             </CardHeader>
             <CardContent className="space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                   <h4 className="font-bold flex items-center gap-2"><Smartphone className="w-4 h-4" /> Screenshot Proof</h4>
                   {battle.screenshotUrl ? (
                     <div className="relative group rounded-2xl overflow-hidden border border-white/10 aspect-[9/16] max-w-[300px] mx-auto bg-black shadow-2xl">
                       <img src={battle.screenshotUrl} alt="Game Screenshot" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300">
                         <a href={battle.screenshotUrl} target="_blank" rel="noopener noreferrer" className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                           <ExternalLink className="w-4 h-4" /> Open Full Image
                         </a>
                       </div>
                     </div>
                   ) : (
                     <div className="aspect-[9/16] max-w-[300px] mx-auto rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-gray-600 bg-white/[0.01]">
                       <ShieldAlert className="w-12 h-12 mb-3 opacity-20" />
                       <p className="text-xs uppercase font-bold tracking-widest">No Screenshot Uploaded</p>
                     </div>
                   )}
                 </div>

                 <div className="space-y-4">
                    <h4 className="font-bold flex items-center gap-2"><Clock className="w-4 h-4" /> Video Proof</h4>
                    {battle.videoProofUrl ? (
                      <div className="rounded-2xl overflow-hidden border border-white/10 aspect-[9/16] max-w-[300px] mx-auto bg-black shadow-2xl">
                        <video 
                          src={battle.videoProofUrl} 
                          controls 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-[9/16] max-w-[300px] mx-auto rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-gray-600 bg-white/[0.01]">
                        <Clock className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-xs uppercase font-bold tracking-widest">No Video Proof Provided</p>
                      </div>
                    )}
                 </div>
               </div>
             </CardContent>
           </Card>
        </TabsContent>

        {/* Tab 4: Result & Settlement */}
        <TabsContent value="settlement" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-green-500" /> Settlement Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Winning Declaration</span>
                  <Badge variant={battle.winnerId ? 'success' : 'outline'}>{battle.winnerId ? 'PAID' : 'PENDING'}</Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Winner</span>
                  <span className="font-bold">{battle.winner?.name || 'Not Declared'}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total Payout</span>
                  <span className="text-2xl font-black text-green-500">₹{battle.prizeAmount}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><IndianRupee className="w-5 h-5 text-purple-500" /> Transaction Ledger</CardTitle>
              </CardHeader>
              <CardContent>
                {battle.walletTransactions && battle.walletTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {battle.walletTransactions.map((tx: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold", tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500')}>
                            {tx.type === 'CREDIT' ? 'IN' : 'OUT'}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{tx.description || 'Transaction'}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{new Date(tx.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className={cn("font-bold text-sm", tx.type === 'CREDIT' ? 'text-green-500' : 'text-red-500')}>
                          {tx.type === 'CREDIT' ? '+' : '-'} ₹{Number(tx.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500 italic text-sm">No transactions found for this battle.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 5: Dispute & Admin Notes */}
        <TabsContent value="dispute" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-purple-500/20 bg-purple-500/[0.02]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-400">
                    <ShieldAlert className="w-5 h-5" /> Admin Resolution Panel
                  </CardTitle>
                  <CardDescription>Resolve disputes and distribute prize money or issue refunds.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resolution Type</label>
                      <Select 
                        value={resolutionData.status}
                        onChange={(e) => setResolutionData({ ...resolutionData, status: e.target.value as any })}
                      >
                        <option value="COMPLETED">Mark Completed (Pay Winner)</option>
                        <option value="CANCELLED">Cancel Match (Refund All)</option>
                      </Select>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {resolutionData.status === 'COMPLETED' 
                          ? 'This will credit the prize amount to the selected winner.' 
                          : 'This will refund the entry fee to both players.'}
                      </p>
                    </div>

                    {resolutionData.status === 'COMPLETED' && (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Declare Winner</label>
                        <Select 
                          value={resolutionData.winnerId}
                          onChange={(e) => setResolutionData({ ...resolutionData, winnerId: e.target.value })}
                        >
                          <option value="">Select the actual winner</option>
                          <option value={battle.creatorId}>{battle.creator?.name} (Creator)</option>
                          {battle.opponentId && (
                            <option value={battle.opponentId}>{battle.opponent?.name} (Opponent)</option>
                          )}
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resolution Notes (Public & Internal)</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none min-h-[150px] transition-all"
                      placeholder="Explain the reasoning for this resolution. This may be visible to players if needed."
                      value={resolutionData.adminNotes}
                      onChange={(e) => setResolutionData({ ...resolutionData, adminNotes: e.target.value })}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <p className="text-[10px] text-gray-500 italic max-w-xs">Note: This action is irreversible once confirmed. Financial ledger will be updated immediately.</p>
                  <Button 
                    onClick={handleResolve}
                    disabled={resolving || !canResolve}
                    className={cn(
                      "px-10 h-12 rounded-2xl font-bold shadow-xl transition-all active:scale-95",
                      resolutionData.status === 'CANCELLED' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"
                    )}
                  >
                    {resolving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                    Save Resolution
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest text-gray-400">Dispute Report</CardTitle>
                </CardHeader>
                <CardContent>
                  {battle.disputed ? (
                    <div className="space-y-4">
                      <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-red-200 text-sm">
                        <p className="font-bold flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4" /> Reported Reason:</p>
                        <p className="italic">"{battle.disputeReason || 'No detailed reason provided.'}"</p>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Reported on {new Date(battle.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-gray-500 italic text-sm">
                      No active dispute reports for this battle.
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-widest text-gray-400">Decision Audit</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Decided By</span>
                    <span className="font-bold text-white">{battle.decidedBy?.name || 'Pending'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Decision Status</span>
                    <Badge variant={battle.winnerId ? 'success' : 'outline'} className="text-[10px]">{battle.winnerId ? 'FINALIZED' : 'OPEN'}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 6: Activity Log */}
        <TabsContent value="activity" className="mt-6">
           <Card>
             <CardHeader>
               <CardTitle>Timeline of Events</CardTitle>
               <CardDescription>A complete audit log of every state change for this battle.</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-purple-500/50 before:via-white/5 before:to-transparent">
                  <TimelineItem 
                    icon={Calendar} 
                    title="Battle Created" 
                    time={new Date(battle.createdAt).toLocaleString()} 
                    description={`Battle was initialized by ${battle.creator?.name} with entry fee of ₹${battle.entryFee}.`}
                    color="bg-purple-500"
                  />
                  {battle.opponent && (
                    <TimelineItem 
                      icon={User} 
                      title="Opponent Joined" 
                      time={new Date(battle.updatedAt).toLocaleString()} // Best guess if no specific joinedAt
                      description={`${battle.opponent.name} joined the battle and room code was revealed.`}
                      color="bg-blue-500"
                    />
                  )}
                  {battle.status === 'DISPUTED' && (
                    <TimelineItem 
                      icon={AlertTriangle} 
                      title="Dispute Raised" 
                      time={new Date(battle.updatedAt).toLocaleString()}
                      description={`A dispute was raised. Reason: ${battle.disputeReason || 'Unspecified'}`}
                      color="bg-red-500"
                    />
                  )}
                  {battle.winnerId && (
                    <TimelineItem 
                      icon={Trophy} 
                      title="Battle Finalized" 
                      time={new Date(battle.updatedAt).toLocaleString()}
                      description={`Winner declared: ${battle.winner?.name}. Prize of ₹${battle.prizeAmount} disbursed.`}
                      color="bg-green-500"
                    />
                  )}
               </div>
             </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PlayerDetailCard({ title, user }: { title: string, user: any }) {
  if (!user) {
    return (
      <Card className="opacity-50">
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent className="py-20 text-center text-gray-500 italic">No player data available.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:border-purple-500/30 transition-colors group">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <User className="w-5 h-5 text-purple-400" /> {title}
          </CardTitle>
          <Badge variant="outline" className="text-[10px] group-hover:bg-purple-500 group-hover:text-white transition-colors">PLAYER INFO</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <Avatar className="w-16 h-16 ring-2 ring-white/10 ring-offset-2 ring-offset-[#0a0a0a]">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-xl font-black">{user.name}</h4>
            <p className="text-sm text-gray-500 font-mono tracking-tight">+91 {user.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Current Balance</p>
            <p className="text-lg font-bold text-green-500">₹{user.walletBalance.toLocaleString()}</p>
          </div>
          <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Total Earnings</p>
            <p className="text-lg font-bold text-blue-400">₹{user.totalEarnings.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">KYC Status</span>
            <Badge variant={user.kycStatus === 'Verified' ? 'success' : 'warning'}>{user.kycStatus}</Badge>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Account Status</span>
            <span className="font-semibold text-white">{user.status}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Referral Code</span>
            <code className="text-purple-400 font-mono font-bold">{user.referralCode}</code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineItem({ icon: Icon, title, time, description, color }: any) {
  return (
    <div className="relative pl-12">
      <div className={cn("absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#0a0a0a] ring-2 ring-white/5 shadow-xl", color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex flex-col space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white">{title}</h4>
          <span className="text-[10px] text-gray-500 font-mono">{time}</span>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
