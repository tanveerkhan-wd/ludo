import { z } from 'zod';

export type BattleStatus = 'OPEN' | 'FULL' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED' | 'ABANDONED';
export type BattleResult = 'PENDING' | 'WIN' | 'LOSS' | 'CANCEL' | 'DRAW';

export interface IBattle {
  id: string;
  battleId: string;
  creatorId: string;
  creator?: {
    id: string;
    name: string;
    phone: string;
  };
  opponentId?: string | null;
  opponent?: {
    id: string;
    name: string;
    phone: string;
  } | null;
  entryFee: number;
  prizeAmount: number;
  platformFee: number;
  roomCode: string;
  status: BattleStatus;
  result: BattleResult;
  winnerId?: string | null;
  winner?: {
    id: string;
    name: string;
  } | null;
  resultPostedById?: string | null;
  resultSubmittedAt?: string | null;
  screenshotUrl?: string | null;
  videoProofUrl?: string | null;
  proofSubmittedById?: string | null;
  proofSubmittedBy?: {
    id: string;
    name: string;
  } | null;
  disputed: boolean;
  disputeReason?: string | null;
  adminDecision?: string | null;
  adminNotes?: string | null;
  decidedById?: string | null;
  decidedBy?: {
    id: string;
    name: string;
  } | null;
  walletTransactions?: {
    amount: number;
    type: string;
    status: string;
    description: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export const CreateBattleSchema = z.object({
  entryFee: z.number().positive(),
  roomCode: z.string().min(4).max(10),
});

export const JoinBattleSchema = z.object({
  battleId: z.string(),
});

export const SubmitResultSchema = z.object({
  battleId: z.string(),
  result: z.enum(['WIN', 'LOSS', 'CANCEL']),
  screenshotUrl: z.string().url().optional(),
  videoProofUrl: z.string().url().optional(),
});

export const ResolveDisputeSchema = z.object({
  battleId: z.string(),
  winnerId: z.string().nullable(),
  adminNotes: z.string().optional(),
  status: z.enum(['COMPLETED', 'CANCELLED']).optional(),
});
