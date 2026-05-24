'use client';

import { useState } from 'react';
import { IBattle } from '@/types/battle';
import { Modal, Badge, Button, Input, Select, cn } from '@/components/ui';
import { 
  Swords, 
  User, 
  Wallet, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Image as ImageIcon,
  ExternalLink,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface BattleDetailsModalProps {
  battle: IBattle | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function BattleDetailsModal({ battle, isOpen, onClose, onUpdate }: BattleDetailsModalProps) {
  const [resolving, setResolving] = useState(false);
  const [resolutionData, setResolutionData] = useState({
    winnerId: '',
    status: 'COMPLETED' as 'COMPLETED' | 'CANCELLED',
    adminNotes: '',
  });

  if (!battle) return null;

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
        toast.success('Battle resolved successfully');
        onUpdate();
        onClose();
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

  const canResolve = ['DISPUTED', 'IN_PROGRESS', 'FULL', 'OPEN'].includes(battle.status);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Battle Details: ${battle.battleId}`}
      className="max-w-4xl max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-8 pb-4">
        {/* Header Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-2 text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-xs uppercase font-bold">Status</span>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant={battle.status === 'COMPLETED' ? 'success' : battle.status === 'DISPUTED' ? 'destructive' : 'secondary'}>
                {battle.status}
              </Badge>
              <span className="text-[10px] text-gray-500">{new Date(battle.createdAt).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-2 text-gray-400">
              <Wallet className="w-4 h-4" />
              <span className="text-xs uppercase font-bold">Entry / Prize</span>
            </div>
            <p className="text-lg font-bold">₹{battle.entryFee} <span className="text-gray-500 font-normal text-sm">/</span> <span className="text-green-500">₹{battle.prizeAmount}</span></p>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 mb-2 text-gray-400">
              <Swords className="w-4 h-4" />
              <span className="text-xs uppercase font-bold">Room Code</span>
            </div>
            <code className="text-lg font-mono text-purple-400">{battle.roomCode}</code>
          </div>
        </div>

        {/* Players Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-blue-400"><User className="w-4 h-4" /> Creator (Player 1)</h3>
            <div className="bg-[#1a1a1a] p-4 rounded-xl space-y-2 border border-blue-500/10">
              <p className="font-bold">{battle.creator?.name || 'Unknown'}</p>
              <p className="text-sm text-gray-400 font-mono">+91 {battle.creator?.phone}</p>
              {battle.winnerId === battle.creatorId && (
                <Badge variant="success" className="gap-1"><Trophy className="w-3 h-3" /> Winner</Badge>
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-red-400"><User className="w-4 h-4" /> Opponent (Player 2)</h3>
            <div className="bg-[#1a1a1a] p-4 rounded-xl space-y-2 border border-red-500/10">
              {battle.opponent ? (
                <>
                  <p className="font-bold">{battle.opponent.name}</p>
                  <p className="text-sm text-gray-400 font-mono">+91 {battle.opponent.phone}</p>
                  {battle.winnerId === battle.opponentId && (
                    <Badge variant="success" className="gap-1"><Trophy className="w-3 h-3" /> Winner</Badge>
                  )}
                </>
              ) : (
                <p className="text-gray-500 italic py-2">Waiting for opponent...</p>
              )}
            </div>
          </div>
        </div>

        {/* Proof Section */}
        {(battle.screenshotUrl || battle.disputed) && (
          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-yellow-400"><ImageIcon className="w-4 h-4" /> Proof & Evidence</h3>
            <div className="bg-[#1a1a1a] p-4 rounded-xl border border-yellow-500/10 grid grid-cols-1 md:grid-cols-2 gap-4">
              {battle.screenshotUrl ? (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400 uppercase font-bold">Screenshot</p>
                  <a href={battle.screenshotUrl} target="_blank" rel="noopener noreferrer" className="block relative group rounded-lg overflow-hidden border border-white/5 aspect-video">
                    <img src={battle.screenshotUrl} alt="Battle Proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <ExternalLink className="w-6 h-6" />
                    </div>
                  </a>
                </div>
              ) : (
                <div className="flex items-center justify-center border border-dashed border-white/10 rounded-lg aspect-video text-gray-500 text-sm">
                  No screenshot uploaded
                </div>
              )}
              
              {battle.disputed && (
                <div className="space-y-2">
                  <p className="text-xs text-red-400 uppercase font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> Dispute Reason
                  </p>
                  <div className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg text-sm text-gray-300 min-h-[100px]">
                    {battle.disputeReason || 'No reason provided by players.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resolution Section (Only for Admins to take action) */}
        {canResolve && (
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="font-bold flex items-center gap-2 text-purple-400"><ShieldAlert className="w-4 h-4" /> Admin Resolution</h3>
            <div className="bg-purple-500/5 border border-purple-500/20 p-6 rounded-2xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">Action Type</label>
                  <Select 
                    value={resolutionData.status}
                    onChange={(e) => setResolutionData({ ...resolutionData, status: e.target.value as any })}
                  >
                    <option value="COMPLETED">Declare Winner (Payout)</option>
                    <option value="CANCELLED">Cancel Battle (Refund Both)</option>
                  </Select>
                </div>

                {resolutionData.status === 'COMPLETED' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">Select Winner</label>
                    <Select 
                      value={resolutionData.winnerId}
                      onChange={(e) => setResolutionData({ ...resolutionData, winnerId: e.target.value })}
                    >
                      <option value="">Select Winner</option>
                      <option value={battle.creatorId}>{battle.creator?.name} (Creator)</option>
                      {battle.opponentId && (
                        <option value={battle.opponentId}>{battle.opponent?.name} (Opponent)</option>
                      )}
                    </Select>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Admin Notes (Internal)</label>
                <textarea 
                  className="w-full bg-[#121212] border border-white/10 rounded-xl p-4 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none min-h-[100px]"
                  placeholder="Explain the reason for this decision..."
                  value={resolutionData.adminNotes}
                  onChange={(e) => setResolutionData({ ...resolutionData, adminNotes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button 
                  onClick={handleResolve}
                  disabled={resolving}
                  className={cn(
                    "w-full md:w-auto px-8",
                    resolutionData.status === 'CANCELLED' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"
                  )}
                >
                  {resolving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  {resolutionData.status === 'CANCELLED' ? 'Confirm Cancellation' : 'Confirm Payout'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Final Decision Info (if already decided) */}
        {battle.status === 'COMPLETED' && battle.adminDecision && (
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="font-bold flex items-center gap-2 text-green-400"><CheckCircle2 className="w-4 h-4" /> Final Decision</h3>
            <div className="bg-green-500/5 border border-green-500/20 p-4 rounded-xl text-sm space-y-2">
              <p><span className="text-gray-400">Decision:</span> {battle.adminDecision}</p>
              {battle.adminNotes && <p><span className="text-gray-400">Notes:</span> {battle.adminNotes}</p>}
              {battle.decidedBy && <p className="text-[10px] text-gray-500 uppercase">Decided by: {battle.decidedBy.name}</p>}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// Helper icon
function Trophy(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}
