/*
  Warnings:

  - You are about to drop the column `kycStatus` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `totalEarnings` on the `User` table. All the data in the column will be lost.
  - Added the required column `transactionId` to the `WalletTransaction` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `WalletTransaction` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "KYC" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kycStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "aadhaarFrontUrl" TEXT,
    "aadhaarBackUrl" TEXT,
    "panUrl" TEXT,
    "bankAccountNumber" TEXT,
    "bankIfscCode" TEXT,
    "bankHolderName" TEXT,
    "rejectionReason" TEXT,
    "submittedAt" DATETIME,
    "verifiedAt" DATETIME,
    "reviewedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "KYC_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KYC_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "platformName" TEXT NOT NULL DEFAULT 'Bajiger Ludo',
    "tagline" TEXT NOT NULL DEFAULT 'Play. Compete. Earn.',
    "logoUrl" TEXT,
    "contactEmail" TEXT NOT NULL DEFAULT 'support@bajigerludo.com',
    "supportWhatsApp" TEXT NOT NULL DEFAULT '+919999999999',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "referralEnabled" BOOLEAN NOT NULL DEFAULT true,
    "referralPercent" DECIMAL NOT NULL DEFAULT 3.0,
    "minEntryFee" DECIMAL NOT NULL DEFAULT 0.0,
    "minWithdrawalAmount" DECIMAL NOT NULL DEFAULT 100.0,
    "dailyWithdrawalLimit" DECIMAL NOT NULL DEFAULT 10000.0,
    "withdrawalFeePercent" DECIMAL NOT NULL DEFAULT 0.0,
    "withdrawalFeeFixed" DECIMAL NOT NULL DEFAULT 0.0,
    "autoApprovalLimit" DECIMAL NOT NULL DEFAULT 0.0,
    "platformFeePercent" DECIMAL NOT NULL DEFAULT 10.0,
    "minBattleEntry" DECIMAL NOT NULL DEFAULT 10.0,
    "maxBattleEntry" DECIMAL NOT NULL DEFAULT 10000.0,
    "autoCancelMinutes" INTEGER NOT NULL DEFAULT 15,
    "resultSubmitWindowMinutes" INTEGER NOT NULL DEFAULT 30,
    "razorpayKeyId" TEXT,
    "razorpayKeySecret" TEXT,
    "cashfreeAppId" TEXT,
    "cashfreeSecretKey" TEXT,
    "zapupiKey" TEXT,
    "activePaymentGateway" TEXT NOT NULL DEFAULT 'NONE',
    "paymentTestMode" BOOLEAN NOT NULL DEFAULT true,
    "webhookUrl" TEXT NOT NULL DEFAULT 'http://localhost:3000/api/webhooks/payment',
    "otpExpiryMinutes" INTEGER NOT NULL DEFAULT 5,
    "rateLimitPerMinute" INTEGER NOT NULL DEFAULT 10,
    "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 60,
    "kycRequired" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SystemSettings" ("id", "minEntryFee", "platformFeePercent", "referralEnabled", "referralPercent", "updatedAt") SELECT "id", "minEntryFee", "platformFeePercent", "referralEnabled", "referralPercent", "updatedAt" FROM "SystemSettings";
DROP TABLE "SystemSettings";
ALTER TABLE "new_SystemSettings" RENAME TO "SystemSettings";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Player',
    "avatar" TEXT,
    "userType" TEXT NOT NULL DEFAULT 'Player',
    "password" TEXT,
    "referralCode" TEXT NOT NULL,
    "referredById" TEXT,
    "walletBalance" DECIMAL NOT NULL DEFAULT 0,
    "totalDeposited" DECIMAL NOT NULL DEFAULT 0,
    "totalWithdrawn" DECIMAL NOT NULL DEFAULT 0,
    "totalWinnings" DECIMAL NOT NULL DEFAULT 0,
    "totalReferralEarnings" DECIMAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "accountDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" DATETIME,
    "lastLoginAt" DATETIME,
    "deviceInfo" TEXT,
    "otp" TEXT,
    "otpExpiry" DATETIME,
    "upiId" TEXT,
    "bankAccountNumber" TEXT,
    "bankIfscCode" TEXT,
    "bankAccountHolderName" TEXT,
    "preferredWithdrawalMethod" TEXT NOT NULL DEFAULT 'UPI',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("accountDeleted", "avatar", "bankAccountHolderName", "bankAccountNumber", "bankIfscCode", "createdAt", "deletedAt", "deviceInfo", "id", "lastLoginAt", "name", "otp", "otpExpiry", "password", "phone", "preferredWithdrawalMethod", "referralCode", "referredById", "status", "totalReferralEarnings", "updatedAt", "upiId", "userType", "walletBalance") SELECT "accountDeleted", "avatar", "bankAccountHolderName", "bankAccountNumber", "bankIfscCode", "createdAt", "deletedAt", "deviceInfo", "id", "lastLoginAt", "name", "otp", "otpExpiry", "password", "phone", "preferredWithdrawalMethod", "referralCode", "referredById", "status", "totalReferralEarnings", "updatedAt", "upiId", "userType", "walletBalance" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
CREATE INDEX "User_phone_idx" ON "User"("phone");
CREATE INDEX "User_referralCode_idx" ON "User"("referralCode");
CREATE TABLE "new_WalletTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "battleId" TEXT,
    "withdrawalId" TEXT,
    "description" TEXT NOT NULL,
    "metadata" TEXT,
    "adminId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WalletTransaction_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WalletTransaction_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES "WithdrawalRequest" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WalletTransaction_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_WalletTransaction" ("amount", "battleId", "createdAt", "description", "id", "status", "type", "userId") SELECT "amount", "battleId", "createdAt", "description", "id", "status", "type", "userId" FROM "WalletTransaction";
DROP TABLE "WalletTransaction";
ALTER TABLE "new_WalletTransaction" RENAME TO "WalletTransaction";
CREATE UNIQUE INDEX "WalletTransaction_transactionId_key" ON "WalletTransaction"("transactionId");
CREATE INDEX "WalletTransaction_userId_idx" ON "WalletTransaction"("userId");
CREATE INDEX "WalletTransaction_transactionId_idx" ON "WalletTransaction"("transactionId");
CREATE INDEX "WalletTransaction_type_idx" ON "WalletTransaction"("type");
CREATE INDEX "WalletTransaction_status_idx" ON "WalletTransaction"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "KYC_userId_key" ON "KYC"("userId");

-- CreateIndex
CREATE INDEX "KYC_userId_idx" ON "KYC"("userId");

-- CreateIndex
CREATE INDEX "KYC_kycStatus_idx" ON "KYC"("kycStatus");
