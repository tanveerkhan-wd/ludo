import { z } from 'zod';

export const CreateBattleSchema = z.object({
  entryFee: z.number().positive(),
  roomCode: z.string().min(4).max(10),
});

export const JoinBattleSchema = z.object({
  battleId: z.string(),
});

export const SubmitResultSchema = z.object({
  battleId: z.string(),
  result: z.enum(['WIN', 'LOSS', 'DRAW']),
  screenshotUrl: z.string().url().optional(),
  videoProofUrl: z.string().url().optional(),
});

export const ResolveDisputeSchema = z.object({
  battleId: z.string(),
  winnerId: z.string(),
  adminNotes: z.string().optional(),
});
