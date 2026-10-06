-- CreateEnum
CREATE TYPE "TermDepositStatus" AS ENUM ('ACTIVE', 'MATURED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WalletTransactionType" ADD VALUE 'TERM_DEPOSIT_OPEN';
ALTER TYPE "WalletTransactionType" ADD VALUE 'TERM_DEPOSIT_PAYOUT';

-- CreateTable
CREATE TABLE "TermDepositAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "principal" DECIMAL(24,6) NOT NULL,
    "annualRate" DECIMAL(8,4) NOT NULL,
    "termDays" INTEGER NOT NULL,
    "interest" DECIMAL(24,6) NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "maturesAt" TIMESTAMP(3) NOT NULL,
    "status" "TermDepositStatus" NOT NULL DEFAULT 'ACTIVE',
    "settledAt" TIMESTAMP(3),

    CONSTRAINT "TermDepositAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TermDepositAccount_userId_status_idx" ON "TermDepositAccount"("userId", "status");

-- CreateIndex
CREATE INDEX "TermDepositAccount_status_maturesAt_idx" ON "TermDepositAccount"("status", "maturesAt");

-- AddForeignKey
ALTER TABLE "TermDepositAccount" ADD CONSTRAINT "TermDepositAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermDepositAccount" ADD CONSTRAINT "TermDepositAccount_productId_fkey" FOREIGN KEY ("productId") REFERENCES "TermDepositProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

