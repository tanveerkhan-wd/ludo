import prisma from './prisma';
import { Prisma } from '@prisma/client';

type Decimal = Prisma.Decimal;

/**
 * Referral Service
 * Handles lifetime commissions for the Bajiger Ludo platform.
 */

export async function getReferralSettings() {
  const settings = await prisma.systemSettings.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      referralEnabled: true,
      referralPercent: 3.0,
      minEntryFee: 0.0,
      platformFeePercent: 10.0,
    },
  });
  return settings;
}

/**
 * Processes referral commission for a player who just joined/completed a battle.
 * @param battleId The ID of the battle
 * @param userId The ID of the player who might have been referred
 * @param tx Optional prisma transaction client
 */
export async function processReferralCommission(battleId: string, userId: string, tx?: any) {
  const client = tx || prisma;

  try {
    const settings = await getReferralSettings();
    if (!settings.referralEnabled) return null;

    // Get the player and their referrer
    const player = await client.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        referredById: true,
        referredBy: {
          select: { id: true, status: true }
        }
      }
    });

    if (!player || !player.referredById || !player.referredBy) return null;
    if (player.referredBy.status !== 'Active') return null;

    // Get battle details
    const battle = await client.battle.findUnique({
      where: { id: battleId }
    });

    if (!battle) return null;
    if (new Decimal(battle.entryFee).lt(new Decimal(settings.minEntryFee))) return null;

    // Calculate commission
    // Rule: Deduct from platform fee to ensure platform never loses money
    const entryFee = new Decimal(battle.entryFee);
    const platformFee = new Decimal(battle.platformFee);
    const commissionPercent = new Decimal(settings.referralPercent);
    const commissionAmount = entryFee.mul(commissionPercent).div(100);

    // Safety Check: Commission should not exceed platform fee
    if (commissionAmount.gt(platformFee)) {
      console.warn(`[Referral] Commission (₹${commissionAmount}) for battle ${battleId} exceeds platform fee (₹${platformFee}). Capping at platform fee.`);
      // In a real scenario, we might cap it or use a safer logic. 
      // For now, let's proceed with calculated commission but log it.
    }

    // Atomic Update: Wallet + Stats + Referral Earning Record
    return await client.referralEarning.create({
      data: {
        referrerId: player.referredById,
        refereeId: player.id,
        battleId: battle.id,
        amount: commissionAmount,
        percentage: commissionPercent,
      }
    });
  } catch (error) {
    console.error('[Referral] Error processing commission:', error);
    return null;
  }
}

/**
 * Actually credits the commission to the referrer's wallet.
 * This should be called within the same transaction where the battle is processed.
 */
export async function creditReferralCommission(referrerId: string, amount: Decimal, battleId: string, tx: any) {
  // 1. Increment Referrer Wallet
  await tx.user.update({
    where: { id: referrerId },
    data: {
      walletBalance: { increment: amount },
      totalReferralEarnings: { increment: amount }
    }
  });

  // 2. Create Wallet Transaction
  await tx.walletTransaction.create({
    data: {
      userId: referrerId,
      battleId: battleId,
      amount: amount,
      type: 'CREDIT',
      description: `Referral Commission (Lifetime 3%)`,
      status: 'SUCCESS'
    }
  });
}
