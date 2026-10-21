-- CreateEnum
CREATE TYPE "LeveragedPositionStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "LeveragedPositionCloseReason" AS ENUM ('USER', 'ADMIN', 'LIQUIDATION');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WalletTransactionType" ADD VALUE 'LEVERAGE_OPEN';
ALTER TYPE "WalletTransactionType" ADD VALUE 'LEVERAGE_CLOSE';

-- CreateTable
CREATE TABLE "LeveragedPosition" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "side" "OrderSide" NOT NULL,
    "quantity" DECIMAL(24,6) NOT NULL,
    "leverage" INTEGER NOT NULL,
    "contractSize" DECIMAL(20,6) NOT NULL DEFAULT 1,
    "currency" TEXT NOT NULL,
    "entryPrice" DECIMAL(20,6) NOT NULL,
    "entryPriceProvenance" "DataProvenance" NOT NULL,
    "margin" DECIMAL(24,6) NOT NULL,
    "status" "LeveragedPositionStatus" NOT NULL DEFAULT 'OPEN',
    "closePrice" DECIMAL(20,6),
    "realizedPnl" DECIMAL(24,6),
    "closeReason" "LeveragedPositionCloseReason",
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" TIMESTAMP(3),

    CONSTRAINT "LeveragedPosition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeveragedPosition_userId_status_idx" ON "LeveragedPosition"("userId", "status");

-- CreateIndex
CREATE INDEX "LeveragedPosition_assetId_idx" ON "LeveragedPosition"("assetId");

-- CreateIndex
CREATE INDEX "LeveragedPosition_status_idx" ON "LeveragedPosition"("status");

-- AddForeignKey
ALTER TABLE "LeveragedPosition" ADD CONSTRAINT "LeveragedPosition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeveragedPosition" ADD CONSTRAINT "LeveragedPosition_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

