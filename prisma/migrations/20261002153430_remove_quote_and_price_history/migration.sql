/*
  Warnings:

  - You are about to drop the `PriceHistory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Quote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PriceHistory" DROP CONSTRAINT "PriceHistory_assetId_fkey";

-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_assetId_fkey";

-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_dataProviderId_fkey";

-- DropTable
DROP TABLE "PriceHistory";

-- DropTable
DROP TABLE "Quote";

-- DropEnum
DROP TYPE "PriceInterval";
