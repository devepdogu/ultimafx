-- CreateEnum
CREATE TYPE "WalletMethod" AS ENUM ('BANK_TRANSFER', 'CRYPTO');

-- AlterTable
ALTER TABLE "Deposit" ADD COLUMN     "cryptoAddressId" TEXT,
ADD COLUMN     "method" "WalletMethod" NOT NULL DEFAULT 'BANK_TRANSFER';

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "destinationAddress" TEXT,
ADD COLUMN     "destinationNetwork" TEXT,
ADD COLUMN     "method" "WalletMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
ALTER COLUMN "destinationIban" DROP NOT NULL,
ALTER COLUMN "destinationBankName" DROP NOT NULL,
ALTER COLUMN "destinationAccountHolder" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CryptoAddress" (
    "id" TEXT NOT NULL,
    "asset" TEXT NOT NULL DEFAULT 'USDT',
    "network" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CryptoAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CryptoAddress_isActive_position_idx" ON "CryptoAddress"("isActive", "position");

-- AddForeignKey
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_cryptoAddressId_fkey" FOREIGN KEY ("cryptoAddressId") REFERENCES "CryptoAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

