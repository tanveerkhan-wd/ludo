-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "withdrawalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "preferredMethod" TEXT NOT NULL,
    "upiId" TEXT,
    "bankDetails" TEXT,
    "notes" TEXT,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME,
    "processedById" TEXT,
    "rejectionReason" TEXT,
    CONSTRAINT "WithdrawalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WithdrawalRequest_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "upiId" TEXT,
    "bankAccountNumber" TEXT,
    "bankIfscCode" TEXT,
    "bankAccountHolderName" TEXT,
    "preferredWithdrawalMethod" TEXT NOT NULL DEFAULT 'UPI',
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

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawalRequest_withdrawalId_key" ON "WithdrawalRequest"("withdrawalId");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_userId_idx" ON "WithdrawalRequest"("userId");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_status_idx" ON "WithdrawalRequest"("status");
