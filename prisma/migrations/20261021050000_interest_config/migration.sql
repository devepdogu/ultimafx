-- AlterTable
ALTER TABLE "TermDepositProduct" ADD COLUMN     "label" TEXT,
ADD COLUMN     "rateMultiplier" DECIMAL(6,4) NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "InterestConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "tryAnnualRate" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "usdAnnualRate" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "autoDistribute" BOOLEAN NOT NULL DEFAULT true,
    "earlyWithdrawalPenaltyPercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterestConfig_pkey" PRIMARY KEY ("id")
);

