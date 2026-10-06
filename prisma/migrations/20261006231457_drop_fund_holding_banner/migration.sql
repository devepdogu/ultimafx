-- DropForeignKey
ALTER TABLE "FundHolding" DROP CONSTRAINT "FundHolding_bannerId_fkey";

-- AlterTable
ALTER TABLE "FundHolding" DROP COLUMN "bannerId";

