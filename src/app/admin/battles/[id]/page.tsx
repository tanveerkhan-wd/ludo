import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import BattleDetailClient from '@/components/Admin/BattleDetailClient';
import { IBattle } from '@/types/battle';

interface BattlePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BattleDetailPage({ params }: BattlePageProps) {
  const { id } = await params;

  try {
    const battle = await prisma.battle.findUnique({
      where: { id },
      include: {
        creator: true,
        opponent: true,
        winner: { select: { id: true, name: true } },
        proofSubmittedBy: { select: { id: true, name: true } },
        decidedBy: { select: { id: true, name: true } },
        walletTransactions: {
          orderBy: { createdAt: 'desc' }
        }
      },
    });

    if (!battle) {
      notFound();
    }

    // Convert Decimal and Date to plain types for Client Component
    const formattedBattle: any = {
      ...battle,
      entryFee: Number(battle.entryFee),
      prizeAmount: Number(battle.prizeAmount),
      platformFee: Number(battle.platformFee),
      createdAt: battle.createdAt.toISOString(),
      updatedAt: battle.updatedAt.toISOString(),
      resultSubmittedAt: battle.resultSubmittedAt?.toISOString() || null,
      walletTransactions: battle.walletTransactions.map(tx => ({
        ...tx,
        amount: Number(tx.amount),
        createdAt: tx.createdAt.toISOString()
      }))
    };

    const formatUser = (user: any) => {
      if (!user) return null;
      return {
        ...user,
        walletBalance: Number(user.walletBalance),
        totalDeposited: Number(user.totalDeposited),
        totalWithdrawn: Number(user.totalWithdrawn),
        totalWinnings: Number(user.totalWinnings),
        totalReferralEarnings: Number(user.totalReferralEarnings),
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        deletedAt: user.deletedAt?.toISOString() || null,
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
        otpExpiry: user.otpExpiry?.toISOString() || null,
      };
    };

    if (formattedBattle.creator) {
      formattedBattle.creator = formatUser(formattedBattle.creator);
    }

    if (formattedBattle.opponent) {
      formattedBattle.opponent = formatUser(formattedBattle.opponent);
    }

    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <BattleDetailClient battle={formattedBattle} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching battle details:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="text-gray-400">Failed to load battle details. Please try again later.</p>
      </div>
    );
  }
}
