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
  CardFooter,
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
  ShieldCheck,
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
  ChevronRight,
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'OPEN': return { variant: 'secondary' as const, label: 'Open' };
      case 'FULL': return { variant: 'warning' as const, label: 'Full', glow: true };
      case 'IN_PROGRESS': return { variant: 'info' as const, label: 'Live', glow: true };
      case 'COMPLETED': return { variant: 'success' as const, label: 'Completed' };
      case 'CANCELLED': return { variant: 'destructive' as const, label: 'Cancelled' };
      case 'DISPUTED': return { variant: 'destructive' as const, label: 'Disputed', glow: true };
      default: return { variant: 'secondary' as const, label: status };
    }
  };

  const status = getStatusConfig(battle.status);
  const canResolve = ['DISPUTED', 'IN_PROGRESS', 'FULL', 'OPEN'].includes(battle.status);

  return (
    <div className="space-y-10 pb-32">
      {/* Breadcrumbs & Navigation */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-500">
          <button onClick={() => router.push('/admin/battles')} className="hover:text-purple-400 transition-colors">Tactical Hub</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-300">Battle Intelligence</span>
        </div>
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-2xl w-14 h-14 bg-white/5 border-white/10 hover:bg-purple-500 hover:text-white transition-all shadow-xl"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tighter text-white">#{battle.battleId}</h1>
                <Badge variant={status.variant} glow={status.glow} className="px-4 py-1.5 rounded-xl h-8">
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-500" /> System Log: {new Date(battle.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              className="h-14 px-8 rounded-2xl gap-3 border-white/10 bg-white/5 font-bold hover:bg-white/10"
              onClick={() => copyToClipboard(battle.battleId, 'Battle ID')}
            >
              <Hash className="w-5 h-5 text-gray-400" /> Copy ID
            </Button>
            <Button 
              variant="premium"
              className="h-14 px-8 rounded-2xl gap-3 font-bold uppercase tracking-widest"
              onClick={() => setActiveTab('dispute')}
            >
              <ShieldAlert className="w-5 h-5" /> Execute Resolution
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
        <div className="sticky top-24 z-10 bg-[#060606]/80 backdrop-blur-2xl py-4 -mx-4 px-4 overflow-x-auto no-scrollbar">
          <TabsList className="w-full justify-start h-16 p-2 bg-white/5 border-white/5 rounded-3xl min-w-max">
            <TabsTrigger value="overview" className="gap-3 h-full px-8 rounded-2xl"><FileText className="w-4 h-4" /> Overview</TabsTrigger>
            <TabsTrigger value="players" className="gap-3 h-full px-8 rounded-2xl"><User className="w-4 h-4" /> Contestants</TabsTrigger>
            <TabsTrigger value="proofs" className="gap-3 h-full px-8 rounded-2xl"><ImageIcon className="w-4 h-4" /> Assets & Proofs</TabsTrigger>
            <TabsTrigger value="settlement" className="gap-3 h-full px-8 rounded-2xl"><IndianRupee className="w-4 h-4" /> Financial Ledger</TabsTrigger>
            <TabsTrigger value="dispute" className="gap-3 h-full px-8 rounded-2xl"><AlertTriangle className="w-4 h-4" /> Decision Core</TabsTrigger>
            <TabsTrigger value="activity" className="gap-3 h-full px-8 rounded-2xl"><History className="w-4 h-4" /> Global Audit</TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="mt-10 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-[#121212] to-[#0a0a0a]">
              <CardHeader>
                <CardTitle className="text-[10px] font-semibold text-gray-500 flex items-center gap-3 uppercase tracking-[0.3em]">
                  <Clock className="w-4 h-4 text-purple-500" /> Protocol Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                  <span className="text-sm font-bold text-gray-400">Room Protocol</span>
                  <div className="flex items-center gap-3">
                    <code className="text-purple-400 font-mono font-bold text-lg">
                      {battle.roomCode}
                    </code>
                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-white/5 hover:bg-purple-500 hover:text-white" onClick={() => copyToClipboard(battle.roomCode, 'Room Code')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-5 rounded-2xl bg-red-500/[0.03] border border-red-500/10">
                     <p className="text-[10px] font-semibold text-red-500/60 uppercase tracking-widest mb-1">Platform Tax</p>
                     <p className="text-2xl font-bold text-white">₹{battle.platformFee}</p>
                   </div>
                   <div className="p-5 rounded-2xl bg-green-500/[0.03] border border-green-500/10 text-right">
                     <p className="text-[10px] font-semibold text-green-500/60 uppercase tracking-widest mb-1">Combat Prize</p>
                     <p className="text-2xl font-bold text-white">₹{battle.prizeAmount}</p>
                   </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <CardHeader>
                <CardTitle className="text-[10px] font-semibold text-gray-500 flex items-center gap-3 uppercase tracking-[0.3em]">
                  <Swords className="w-4 h-4 text-purple-500" /> Tactical Matchup
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-around gap-12 py-6">
                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="flex flex-col items-center text-center space-y-4"
                  >
                    <div className="relative">
                      <Avatar className="w-24 h-24 border-4 border-blue-500/20 p-1.5 ring-4 ring-blue-500/5 bg-[#0a0a0a]">
                        <AvatarImage src={battle.creator?.avatar} />
                        <AvatarFallback>{battle.creator?.name[0]}</AvatarFallback>
                      </Avatar>
                      <Badge variant="info" className="absolute -top-2 -right-2 px-3 py-1 rounded-lg border-2 border-[#0a0a0a] shadow-xl">Creator</Badge>
                    </div>
                    <div>
                      <p className="font-bold text-xl tracking-tight">{battle.creator?.name}</p>
                      <p className="text-xs text-gray-500 font-mono mt-1">+91 {battle.creator?.phone}</p>
                    </div>
                    {battle.winnerId === battle.creatorId && (
                       <Badge variant="success" glow className="gap-2 py-1.5 px-4 rounded-xl font-bold uppercase italic tracking-widest">
                         <Trophy className="w-4 h-4" /> Victor
                       </Badge>
                    )}
                  </motion.div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative">
                      <span className="text-sm font-bold text-gray-500 uppercase italic tracking-tighter">VS</span>
                      <div className="absolute inset-0 bg-purple-500/10 blur-xl rounded-full animate-pulse" />
                    </div>
                    <div className="h-16 w-0.5 bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />
                  </div>

                  <motion.div 
                    whileHover={{ y: -5 }}
                    className="flex flex-col items-center text-center space-y-4"
                  >
                    {battle.opponent ? (
                      <>
                        <div className="relative">
                          <Avatar className="w-24 h-24 border-4 border-red-500/20 p-1.5 ring-4 ring-red-500/5 bg-[#0a0a0a]">
                            <AvatarImage src={battle.opponent.avatar} />
                            <AvatarFallback>{battle.opponent.name[0]}</AvatarFallback>
                          </Avatar>
                          <Badge variant="destructive" className="absolute -top-2 -right-2 px-3 py-1 rounded-lg border-2 border-[#0a0a0a] shadow-xl">Opponent</Badge>
                        </div>
                        <div>
                          <p className="font-bold text-xl tracking-tight">{battle.opponent.name}</p>
                          <p className="text-xs text-gray-500 font-mono mt-1">+91 {battle.opponent.phone}</p>
                        </div>
                        {battle.winnerId === battle.opponentId && (
                           <Badge variant="success" glow className="gap-2 py-1.5 px-4 rounded-xl font-bold uppercase italic tracking-widest">
                             <Trophy className="w-4 h-4" /> Victor
                           </Badge>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center opacity-40 space-y-4 italic">
                        <div className="w-24 h-24 rounded-[2rem] border-4 border-dashed border-white/10 flex items-center justify-center bg-white/[0.02]">
                          <Clock className="w-10 h-10 text-gray-500 animate-spin-slow" />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Scanning for Match...</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {[
               { label: 'Strategic Entry', value: `₹${battle.entryFee}`, icon: IndianRupee, color: 'text-blue-400', bg: 'bg-blue-400/10' },
               { label: 'System Tax', value: `₹${battle.platformFee}`, icon: Wallet, color: 'text-red-400', bg: 'bg-red-400/10' },
               { label: 'Yield Value', value: `₹${battle.prizeAmount}`, icon: Zap, color: 'text-green-400', bg: 'bg-green-400/10' },
               { label: 'Live Status', value: battle.status, icon: ShieldAlert, color: 'text-purple-400', bg: 'bg-purple-400/10' },
             ].map((item, i) => (
               <Card key={i} className="hover:scale-[1.02] transition-all duration-300">
                 <CardContent className="p-6 flex items-center gap-5">
                   <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg", item.bg, item.color)}>
                     <item.icon className="w-7 h-7" />
                   </div>
                   <div>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">{item.label}</p>
                     <p className="text-2xl font-bold text-white">{item.value}</p>
                   </div>
                 </CardContent>
               </Card>
             ))}
          </div>
        </TabsContent>

        {/* Tab 2: Players */}
        <TabsContent value="players" className="mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <PlayerDetailCard title="Creator Protocol" user={battle.creator} accent="blue" />
            <PlayerDetailCard title="Opponent Protocol" user={battle.opponent} accent="red" />
          </div>
        </TabsContent>

        {/* Tab 3: Game Proofs */}
        <TabsContent value="proofs" className="mt-10">
           <Card className="overflow-visible border-white/5 bg-[#121212]/40 backdrop-blur-xl">
             <CardHeader className="px-10 py-8 border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                    <CardTitle className="flex items-center gap-4 text-2xl font-bold tracking-tight">
                      <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      Integrity Validation Assets
                    </CardTitle>
                    <CardDescription className="mt-2 font-medium text-gray-500">Cryptographic verification assets submitted for match validation.</CardDescription>
                  </div>
                  {battle.proofSubmittedBy && (
                    <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                      <Avatar className="w-10 h-10 rounded-xl">
                        <AvatarImage src={battle.proofSubmittedBy.avatar} />
                        <AvatarFallback>{battle.proofSubmittedBy.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest leading-none mb-1">Logged By</p>
                        <p className="text-sm font-bold text-white">{battle.proofSubmittedBy.name}</p>
                      </div>
                    </div>
                  )}
                </div>
             </CardHeader>
             <CardContent className="px-10 py-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="space-y-6">
                   <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                     <Smartphone className="w-4 h-4 text-purple-500" /> Visual Log (Screenshot)
                   </h4>
                   <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="relative group rounded-[2.5rem] overflow-hidden border border-white/10 aspect-[9/16] max-w-[400px] mx-auto bg-black shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]"
                   >
                     {battle.screenshotUrl ? (
                       <>
                         <img src={battle.screenshotUrl} alt="Game Screenshot" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-end pb-12">
                           <a href={battle.screenshotUrl} target="_blank" rel="noopener noreferrer" className="bg-white text-black px-8 py-4 rounded-2xl text-xs font-semibold uppercase tracking-widest flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-2xl active:scale-95">
                             <ExternalLink className="w-4 h-4" /> Open Full Asset
                           </a>
                         </div>
                       </>
                     ) : (
                       <div className="h-full w-full flex flex-col items-center justify-center text-gray-700 bg-white/[0.01]">
                         <ShieldAlert className="w-16 h-16 mb-6 opacity-20" />
                         <p className="text-[10px] font-semibold uppercase tracking-[0.3em]">No Visual Asset Uploaded</p>
                       </div>
                     )}
                   </motion.div>
                 </div>

                 <div className="space-y-6">
                    <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                      <Clock className="w-4 h-4 text-purple-500" /> Temporal Stream (Video)
                    </h4>
                    <div className="rounded-[2.5rem] overflow-hidden border border-white/10 aspect-[9/16] max-w-[400px] mx-auto bg-black shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]">
                      {battle.videoProofUrl ? (
                        <video 
                          src={battle.videoProofUrl} 
                          controls 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-gray-700 bg-white/[0.01]">
                          <Clock className="w-16 h-16 mb-6 opacity-20" />
                          <p className="text-[10px] font-semibold uppercase tracking-[0.3em]">No Video Stream Provided</p>
                        </div>
                      )}
                    </div>
                 </div>
               </div>
             </CardContent>
           </Card>
        </TabsContent>

        {/* Tab 4: Result & Settlement */}
        <TabsContent value="settlement" className="mt-10 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card className="bg-gradient-to-br from-[#121212] to-[#0a0a0a]">
              <CardHeader className="px-10 py-8">
                <CardTitle className="flex items-center gap-4 text-2xl font-bold tracking-tight text-green-500">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                    <Trophy className="w-6 h-6" />
                  </div>
                  Settlement Intelligence
                </CardTitle>
              </CardHeader>
              <CardContent className="px-10 pb-10 space-y-8">
                <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Declaration Pulse</span>
                  <Badge variant={battle.winnerId ? 'success' : 'premium'} glow={!battle.winnerId} className="px-6 py-1.5 rounded-xl font-bold">
                    {battle.winnerId ? 'LIQUIDATED' : 'SETTLEMENT PENDING'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Declared Victor</p>
                    <p className="text-xl font-bold text-white">{battle.winner?.name || '---'}</p>
                  </div>
                  <div className="p-6 rounded-3xl bg-green-500/[0.03] border border-green-500/10">
                    <p className="text-[10px] font-semibold text-green-500 uppercase tracking-widest mb-2">Total Liquidation</p>
                    <p className="text-3xl font-bold text-white tracking-tighter">₹{battle.prizeAmount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-10 py-8">
                <CardTitle className="flex items-center gap-4 text-2xl font-bold tracking-tight text-purple-400">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  Transaction Audit Ledger
                </CardTitle>
              </CardHeader>
              <CardContent className="px-10 pb-10">
                {battle.walletTransactions && battle.walletTransactions.length > 0 ? (
                  <div className="space-y-4">
                    {battle.walletTransactions.map((tx: any, i: number) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center justify-between p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group"
                      >
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-semibold border group-hover:scale-110 transition-transform", 
                            tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500 border-green-500/10' : 'bg-red-500/10 text-red-500 border-red-500/10'
                          )}>
                            {tx.type === 'CREDIT' ? 'IN' : 'OUT'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white tracking-tight">{tx.description || 'System Entry'}</p>
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.1em] mt-0.5">{new Date(tx.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <p className={cn("font-bold text-lg tracking-tighter", tx.type === 'CREDIT' ? 'text-green-500' : 'text-red-500')}>
                          {tx.type === 'CREDIT' ? '+' : '-'} ₹{Number(tx.amount)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center opacity-30">
                    <History className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Audit Ledger is Empty</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 5: Dispute & Admin Notes */}
        <TabsContent value="dispute" className="mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              <Card className="border-purple-500/20 bg-purple-500/[0.01] shadow-[0_0_50px_rgba(168,85,247,0.05)]">
                <CardHeader className="px-10 py-8 border-purple-500/10">
                  <CardTitle className="flex items-center gap-4 text-2xl font-bold tracking-tight text-purple-400">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    Executive Resolution Core
                  </CardTitle>
                  <CardDescription className="mt-2 text-gray-400 font-medium">Finalize tactical outcomes or execute emergency asset redistribution.</CardDescription>
                </CardHeader>
                <CardContent className="px-10 py-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.3em]">Operational Protocol</label>
                      <Select 
                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-base font-bold focus:ring-purple-500/50"
                        value={resolutionData.status}
                        onChange={(e) => setResolutionData({ ...resolutionData, status: e.target.value as any })}
                      >
                        <option value="COMPLETED">Commit Victory (Liquidate Payout)</option>
                        <option value="CANCELLED">Execute Nullification (Total Refund)</option>
                      </Select>
                      <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest italic px-2">
                        {resolutionData.status === 'COMPLETED' 
                          ? 'COMMIT: Prize pool will be transmitted to the verified victor.' 
                          : 'NULLIFY: All entries will be reversed to origin wallets.'}
                      </p>
                    </div>

                    {resolutionData.status === 'COMPLETED' && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-3"
                      >
                        <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.3em]">Declare Victor ID</label>
                        <Select 
                          className="h-14 rounded-2xl bg-white/5 border-white/10 text-base font-bold focus:ring-purple-500/50"
                          value={resolutionData.winnerId}
                          onChange={(e) => setResolutionData({ ...resolutionData, winnerId: e.target.value })}
                        >
                          <option value="">Scan contestants...</option>
                          <option value={battle.creatorId}>{battle.creator?.name} (Originator)</option>
                          {battle.opponentId && (
                            <option value={battle.opponentId}>{battle.opponent?.name} (Adversary)</option>
                          )}
                        </Select>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-[0.3em]">Executive Audit Notes (Internal/Public)</label>
                    <textarea 
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 text-sm font-medium focus:ring-4 focus:ring-purple-500/20 outline-none min-h-[200px] transition-all hover:bg-white/[0.07] placeholder:text-gray-700"
                      placeholder="Input strategic reasoning for this executive action. System audit logs will index this entry."
                      value={resolutionData.adminNotes}
                      onChange={(e) => setResolutionData({ ...resolutionData, adminNotes: e.target.value })}
                    />
                  </div>
                </CardContent>
                <CardFooter className="px-10 py-8 bg-purple-500/[0.02] border-purple-500/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em]">IRREVERSIBLE OPERATION: PROCEED WITH CAUTION</p>
                  </div>
                  <Button 
                    onClick={handleResolve}
                    disabled={resolving || !canResolve}
                    variant="premium"
                    className="w-full sm:w-auto h-14 px-12 rounded-2xl font-bold uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(168,85,247,0.4)]"
                  >
                    {resolving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <ShieldCheck className="w-5 h-5 mr-3" />}
                    Confirm Resolution
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="space-y-8">
              <Card className="bg-[#121212]/30 border-red-500/10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-[10px] uppercase font-bold tracking-[0.4em] text-red-500/60">Dispute Intelligence</CardTitle>
                </CardHeader>
                <CardContent>
                  {battle.disputed ? (
                    <div className="space-y-6">
                      <div className="bg-red-500/5 border border-red-500/20 p-6 rounded-3xl shadow-inner">
                        <p className="text-[9px] font-bold text-red-500/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-3 h-3" /> Reported Origin:
                        </p>
                        <p className="text-sm font-medium italic text-red-200/80 leading-relaxed line-clamp-6">"{battle.disputeReason || 'No descriptive payload provided.'}"</p>
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-bold text-gray-600 uppercase tracking-widest px-2">
                        <Clock className="w-3 h-3" />
                        <span>Log: {new Date(battle.updatedAt).toLocaleDateString()} @ {new Date(battle.updatedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center opacity-20">
                      <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                      <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">System Integrity: 100%</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-[10px] uppercase font-bold tracking-[0.4em] text-gray-500">Audit Trail</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Lead Strategist</span>
                    <span className="text-xs font-semibold text-white">{battle.decidedBy?.name || 'Awaiting Action'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Protocol Status</span>
                    <Badge variant={battle.winnerId ? 'success' : 'outline'} className="rounded-lg h-6 px-3 text-[8px] font-bold">
                      {battle.winnerId ? 'FINALIZED' : 'IDLE'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Tab 6: Activity Log */}
        <TabsContent value="activity" className="mt-10">
           <Card className="bg-[#121212]/40 backdrop-blur-xl">
             <CardHeader className="px-10 py-8">
               <CardTitle className="text-2xl font-bold tracking-tight">Tactical Event Stream</CardTitle>
               <CardDescription className="mt-2 font-medium text-gray-500 text-sm italic">Immutable timeline of all state transitions and system interactions.</CardDescription>
             </CardHeader>
             <CardContent className="px-10 py-12">
               <div className="relative space-y-12 before:absolute before:inset-0 before:ml-6 before:-translate-x-px before:h-full before:w-[2px] before:bg-gradient-to-b before:from-purple-500/50 before:via-white/5 before:to-transparent">
                  <TimelineItem 
                    icon={Calendar} 
                    title="Protocol Initialization" 
                    time={new Date(battle.createdAt).toLocaleString()} 
                    description={`Battle session established by ${battle.creator?.name}. Origin entry commitment: ₹${battle.entryFee}.`}
                    color="bg-purple-600"
                  />
                  {battle.opponent && (
                    <TimelineItem 
                      icon={User} 
                      title="Adversary Link Established" 
                      time={new Date(battle.updatedAt).toLocaleString()}
                      description={`${battle.opponent.name} has synchronized with the session. Ludo Protocol Revealed.`}
                      color="bg-blue-600"
                    />
                  )}
                  {battle.status === 'DISPUTED' && (
                    <TimelineItem 
                      icon={AlertTriangle} 
                      title="System Integrity Alert" 
                      time={new Date(battle.updatedAt).toLocaleString()}
                      description={`Dispute protocol triggered by participant. Reasoning: ${battle.disputeReason || 'No descriptive payload.'}`}
                      color="bg-red-600"
                    />
                  )}
                  {battle.winnerId && (
                    <TimelineItem 
                      icon={Trophy} 
                      title="Settlement Execution" 
                      time={new Date(battle.updatedAt).toLocaleString()}
                      description={`Liquidation complete. victor declared: ${battle.winner?.name}. Transmitted value: ₹${battle.prizeAmount}.`}
                      color="bg-green-600"
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

function PlayerDetailCard({ title, user, accent }: { title: string, user: any, accent: 'blue' | 'red' }) {
  if (!user) {
    return (
      <Card className="opacity-40 grayscale border-dashed bg-white/[0.01]">
        <CardHeader className="p-8"><CardTitle className="text-sm uppercase tracking-widest text-gray-600">{title}</CardTitle></CardHeader>
        <CardContent className="py-24 text-center">
          <div className="w-16 h-16 rounded-full border-4 border-dashed border-white/5 mx-auto mb-6 flex items-center justify-center">
            <User className="w-8 h-8 text-gray-800" />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gray-700 italic">Participant data not synchronized.</p>
        </CardContent>
      </Card>
    );
  }

  const accentColor = accent === 'blue' ? 'text-blue-400' : 'text-red-400';
  const accentBorder = accent === 'blue' ? 'border-blue-500/20' : 'border-red-500/20';
  const accentBg = accent === 'blue' ? 'bg-blue-500/10' : 'bg-red-500/10';

  return (
    <Card className="hover:border-purple-500/30 group bg-[#121212]/40 backdrop-blur-xl">
      <CardHeader className="p-8 border-white/5">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold flex items-center gap-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", accentBg, accentBorder, accentColor)}>
              <User className="w-5 h-5" />
            </div>
            {title}
          </CardTitle>
          <Badge variant="outline" className="h-6 px-3 rounded-lg text-[9px] font-bold uppercase tracking-widest group-hover:bg-purple-600 group-hover:text-white transition-all group-hover:border-purple-500 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]">INTELLIGENCE</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-10">
        <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 group-hover:bg-white/[0.04] transition-all">
          <Avatar className="w-20 h-24 rounded-[2rem] border-2 border-white/10 ring-4 ring-white/5 shadow-2xl">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-2xl font-bold tracking-tighter text-white">{user.name}</h4>
            <div className="flex items-center gap-3 mt-2">
              <p className="text-sm text-gray-500 font-mono tracking-tight flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5" /> +91 {user.phone}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-3xl group-hover:border-green-500/20 transition-colors">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <Wallet className="w-3 h-3 text-green-500" /> Liquid Balance
            </p>
            <p className="text-2xl font-bold text-green-500 tracking-tighter">₹{user.walletBalance.toLocaleString()}</p>
          </div>
          <div className="bg-[#1a1a1a] border border-white/5 p-6 rounded-3xl group-hover:border-blue-500/20 transition-colors text-right">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-2 flex items-center justify-end gap-2">
              <Trophy className="w-3 h-3 text-blue-500" /> Career Yield
            </p>
            <p className="text-2xl font-bold text-blue-400 tracking-tighter">₹{user.totalWinnings.toLocaleString()}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex justify-between items-center px-4">
            <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">KYC Maturity</span>
            <Badge variant={user.kycStatus === 'Verified' ? 'success' : 'warning'} className="font-bold px-4 py-1 rounded-xl uppercase h-7 text-[9px] italic">
              {user.kycStatus === 'Verified' ? 'FULL VALIDATION' : user.kycStatus.toUpperCase()}
            </Badge>
          </div>
          <Separator />
          <div className="flex justify-between items-center px-4">
            <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Protocol Status</span>
            <span className="text-sm font-bold text-white italic tracking-tighter">{user.status.toUpperCase()}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center px-4">
            <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest">Referral Signature</span>
            <code className="text-purple-400 font-mono font-bold text-base bg-purple-500/5 px-4 py-1 rounded-xl border border-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              {user.referralCode}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TimelineItem({ icon: Icon, title, time, description, color }: any) {
  return (
    <div className="relative pl-16 group">
      <motion.div 
        whileHover={{ scale: 1.2 }}
        className={cn("absolute left-0 flex h-14 w-14 items-center justify-center rounded-[1.5rem] border-4 border-[#060606] ring-2 ring-white/5 shadow-2xl z-10 transition-all", color)}
      >
        <Icon className="h-7 w-7 text-white" />
      </motion.div>
      <div className="flex flex-col space-y-2 p-6 rounded-3xl bg-white/[0.01] border border-white/5 group-hover:bg-white/[0.03] group-hover:border-white/10 transition-all">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-white tracking-tight">{title}</h4>
          <span className="text-[9px] text-gray-600 font-bold uppercase tracking-[0.2em]">{time}</span>
        </div>
        <p className="text-sm text-gray-500 font-medium leading-relaxed italic line-clamp-3">"{description}"</p>
      </div>
    </div>
  );
}
