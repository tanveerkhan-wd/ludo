/*
  Warnings:

  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `entryAmount` on the `Battle` table. All the data in the column will be lost.
  - You are about to drop the column `gameStatus` on the `Battle` table. All the data in the column will be lost.
  - You are about to drop the column `joinedId` on the `Battle` table. All the data in the column will be lost.
  - You are about to alter the column `prizeAmount` on the `Battle` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `totalEarnings` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `totalReferralEarnings` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `walletBalance` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - Added the required column `battleId` to the `Battle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entryFee` to the `Battle` table without a default value. This is not possible if the table is not empty.
  - Added the required column `platformFee` to the `Battle` table without a default value. This is not possible if the table is not empty.
  - Made the column `roomCode` on table `Battle` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Transaction_type_idx";

-- DropIndex
DROP INDEX "Transaction_status_idx";

-- DropIndex
DROP INDEX "Transaction_userId_idx";

-- DropIndex
DROP INDEX "Transaction_transactionId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Transaction";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "battleId" TEXT,
    "amount" DECIMAL NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WalletTransaction_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Battle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "battleId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "opponentId" TEXT,
    "entryFee" DECIMAL NOT NULL,
    "prizeAmount" DECIMAL NOT NULL,
    "platformFee" DECIMAL NOT NULL,
    "roomCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "result" TEXT NOT NULL DEFAULT 'PENDING',
    "winnerId" TEXT,
    "resultPostedById" TEXT,
    "resultSubmittedAt" DATETIME,
    "screenshotUrl" TEXT,
    "videoProofUrl" TEXT,
    "proofSubmittedById" TEXT,
    "disputed" BOOLEAN NOT NULL DEFAULT false,
    "disputeReason" TEXT,
    "adminDecision" TEXT,
    "adminNotes" TEXT,
    "decidedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Battle_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Battle_opponentId_fkey" FOREIGN KEY ("opponentId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Battle_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Battle_proofSubmittedById_fkey" FOREIGN KEY ("proofSubmittedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Battle_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Battle" ("createdAt", "creatorId", "id", "prizeAmount", "roomCode", "updatedAt", "winnerId") SELECT "createdAt", "creatorId", "id", "prizeAmount", "roomCode", "updatedAt", "winnerId" FROM "Battle";
DROP TABLE "Battle";
ALTER TABLE "new_Battle" RENAME TO "Battle";
CREATE UNIQUE INDEX "Battle_battleId_key" ON "Battle"("battleId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Player',
    "avatar" TEXT,
    "userType" TEXT NOT NULL DEFAULT 'Player',
    "password" TEXT,
    "referralCode" TEXT NOT NULL,
    "referredById" TEXT,
    "kycStatus" TEXT NOT NULL DEFAULT 'Pending',
    "walletBalance" DECIMAL NOT NULL DEFAULT 0,
    "totalEarnings" DECIMAL NOT NULL DEFAULT 0,
    "totalReferralEarnings" DECIMAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "accountDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "lastLoginAt" DATETIME,
    "deviceInfo" TEXT,
    "otp" TEXT,
    "otpExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("accountDeleted", "avatar", "createdAt", "deletedAt", "deviceInfo", "id", "kycStatus", "lastLoginAt", "name", "otp", "otpExpiry", "password", "phone", "referralCode", "referredById", "status", "totalEarnings", "totalReferralEarnings", "updatedAt", "userType", "walletBalance") SELECT "accountDeleted", "avatar", "createdAt", "deletedAt", "deviceInfo", "id", "kycStatus", "lastLoginAt", "name", "otp", "otpExpiry", "password", "phone", "referralCode", "referredById", "status", "totalEarnings", "totalReferralEarnings", "updatedAt", "userType", "walletBalance" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
CREATE INDEX "User_phone_idx" ON "User"("phone");
CREATE INDEX "User_referralCode_idx" ON "User"("referralCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
