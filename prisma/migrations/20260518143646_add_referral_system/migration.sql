-- CreateTable
CREATE TABLE "ReferralEarning" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "referrerId" TEXT NOT NULL,
    "refereeId" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "percentage" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReferralEarning_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReferralEarning_refereeId_fkey" FOREIGN KEY ("refereeId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReferralEarning_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "referralEnabled" BOOLEAN NOT NULL DEFAULT true,
    "referralPercent" DECIMAL NOT NULL DEFAULT 3.0,
    "minEntryFee" DECIMAL NOT NULL DEFAULT 0.0,
    "platformFeePercent" DECIMAL NOT NULL DEFAULT 10.0,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "ReferralEarning_referrerId_idx" ON "ReferralEarning"("referrerId");

-- CreateIndex
CREATE INDEX "ReferralEarning_refereeId_idx" ON "ReferralEarning"("refereeId");
