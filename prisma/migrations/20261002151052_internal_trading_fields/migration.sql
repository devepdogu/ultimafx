/*
  Warnings:

  - You are about to drop the column `executionProviderRef` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `externalTradeRef` on the `Trade` table. All the data in the column will be lost.
  - Added the required column `priceProvenance` to the `Trade` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deposit" ADD COLUMN     "adminNote" TEXT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "executionProviderRef",
ADD COLUMN     "referencePrice" DECIMAL(20,6),
ADD COLUMN     "referencePriceProvenance" "DataProvenance";

-- AlterTable
ALTER TABLE "Trade" DROP COLUMN "externalTradeRef",
ADD COLUMN     "priceProvenance" "DataProvenance" NOT NULL;

-- AlterTable
ALTER TABLE "Withdrawal" ADD COLUMN     "adminNote" TEXT;
