-- AlterEnum
ALTER TYPE "WalletTransactionType" ADD VALUE 'FX_CONVERSION';

-- AlterTable
ALTER TABLE "TermDepositAccount" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'TRY';

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "usdBalance" DECIMAL(24,6) NOT NULL DEFAULT 0;

